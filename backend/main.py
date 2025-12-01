from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)
    model = genai.GenerativeModel('gemini-2.5-flash')
else:
    print("WARNING: GEMINI_API_KEY not found in environment variables.")
    model = None

SYSTEM_PROMPT = """
You are an AI assistant capable of generating dynamic UI components.
You communicate using the AG-UI protocol.
Your response MUST be a stream of JSON objects, separated by newlines.
Each JSON object represents an event.

Supported Events:
1. Message: { "type": "message", "role": "assistant", "content": "text content" }
2. Update UI: { "type": "update_ui", "component": "component_name", "props": { ... } }

Supported Components:
- 'table': props { headers: string[], data: string[][] }
- 'form': props { title: string, fields: { name: string, label: string, type: string }[] }
- 'card': props { title: string, description: string, imageUrl?: string }
- 'chart': props { title: string, type: 'bar'|'line'|'pie', data: { [key: string]: number|string }[], dataKey: string, categoryKey: string }
- 'steps': props { items: { title: string, description: string, status: 'completed'|'current'|'pending' }[] }
- 'stats': props { items: { label: string, value: string, change?: string, trend?: 'up'|'down'|'neutral' }[] }

Rules:
- If the user asks for data that fits a table, send a 'message' introducing it, then an 'update_ui' with component='table'.
- If the user needs to input data, send a 'message' then 'update_ui' with component='form'.
- If the user asks for a profile or summary, send 'update_ui' with component='card'.
- If the user asks for trends, statistics, or comparisons that are best visualized, send 'update_ui' with component='chart'.
- If the user asks for a process, itinerary, or plan, send 'update_ui' with component='steps'.
- If the user asks for key metrics or a dashboard summary, send 'update_ui' with component='stats'.
- Otherwise, just send 'message' events.
- **CRITICAL: Output strictly valid JSON lines. DO NOT use markdown code blocks (```json).**
- **CRITICAL: Do not pretty-print JSON. Each JSON object must be on a single line.**
- **IMPORTANT: ALWAYS respond in Traditional Chinese (繁體中文).**
"""

@app.get("/")
async def root():
    return {"message": "AG-UI Backend is running"}

import re

# ... (imports)

# ... (system prompt)

async def event_generator(user_message: str):
    if not model:
        yield json.dumps({
            "type": "message",
            "role": "assistant",
            "content": "Error: GEMINI_API_KEY not configured. Please check backend/.env file."
        }) + "\n"
        return

    try:
        # Construct the prompt
        prompt = f"{SYSTEM_PROMPT}\n\nUser: {user_message}\nAssistant:"
        
        response = model.generate_content(prompt, stream=True)
        
        buffer = ""
        
        for chunk in response:
            if chunk.text:
                text_chunk = chunk.text
                # Simple cleanup
                text_chunk = text_chunk.replace("```json", "").replace("```", "")
                
                buffer += text_chunk
                
                while "\n" in buffer:
                    line, buffer = buffer.split("\n", 1)
                    line = line.strip()
                    if not line: continue
                    
                    # Try to parse the whole line as JSON first
                    try:
                        json.loads(line)
                        yield line + "\n"
                        continue
                    except json.JSONDecodeError:
                        pass
                    
                    # If failed, try to find JSON object in the line using regex
                    # Look for { "type": ... } pattern
                    json_match = re.search(r'(\{.*"type"\s*:\s*"(?:message|update_ui)".*\})', line)
                    if json_match:
                        json_str = json_match.group(1)
                        try:
                            # Validate the extracted JSON
                            json.loads(json_str)
                            
                            # If there was text BEFORE the JSON, send it as a message
                            pre_text = line[:json_match.start()].strip()
                            if pre_text:
                                yield json.dumps({
                                    "type": "message",
                                    "role": "assistant",
                                    "content": pre_text
                                }) + "\n"
                                
                            # Send the JSON event
                            yield json_str + "\n"
                            
                            # If there was text AFTER the JSON, send it as a message (or process next)
                            post_text = line[json_match.end():].strip()
                            if post_text:
                                yield json.dumps({
                                    "type": "message",
                                    "role": "assistant",
                                    "content": post_text
                                }) + "\n"
                            
                            continue
                        except json.JSONDecodeError:
                            pass
                    
                    # If still no valid JSON found, treat the whole line as a message
                    yield json.dumps({
                        "type": "message",
                        "role": "assistant",
                        "content": line
                    }) + "\n"
        
        # Process remaining buffer
        if buffer.strip():
             # Same logic for buffer
             line = buffer.strip()
             try:
                json.loads(line)
                yield line + "\n"
             except:
                 # Regex check for buffer
                json_match = re.search(r'(\{.*"type"\s*:\s*"(?:message|update_ui)".*\})', line)
                if json_match:
                    json_str = json_match.group(1)
                    try:
                        json.loads(json_str)
                        pre_text = line[:json_match.start()].strip()
                        if pre_text:
                            yield json.dumps({"type": "message", "role": "assistant", "content": pre_text}) + "\n"
                        yield json_str + "\n"
                        post_text = line[json_match.end():].strip()
                        if post_text:
                            yield json.dumps({"type": "message", "role": "assistant", "content": post_text}) + "\n"
                    except:
                        yield json.dumps({"type": "message", "role": "assistant", "content": line}) + "\n"
                else:
                    yield json.dumps({
                        "type": "message",
                        "role": "assistant",
                        "content": line
                    }) + "\n"
                        
    except Exception as e:
        yield json.dumps({
            "type": "message",
            "role": "assistant",
            "content": f"Error generating response: {str(e)}"
        }) + "\n"

@app.post("/agent")
async def agent_endpoint(request: Request):
    body = await request.json()
    user_message = body.get("message", "")
    return StreamingResponse(event_generator(user_message), media_type="application/x-ndjson")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
