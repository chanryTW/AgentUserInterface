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

Rules:
- If the user asks for data that fits a table, send a 'message' introducing it, then an 'update_ui' with component='table'.
- If the user needs to input data, send a 'message' then 'update_ui' with component='form'.
- If the user asks for a profile or summary, send 'update_ui' with component='card'.
- Otherwise, just send 'message' events.
- ALWAYS output valid JSON on each line. Do not wrap in markdown code blocks.
"""

@app.get("/")
async def root():
    return {"message": "AG-UI Backend is running"}

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
        
        for chunk in response:
            if chunk.text:
                # Gemini might return multiple lines or partial JSON. 
                # For simplicity in this demo, we assume Gemini follows instructions 
                # and outputs line-delimited JSON or we treat text as message.
                # However, raw text from Gemini might not be perfect JSON lines if not strictly enforced.
                # To make it robust, we'll try to parse lines, or wrap plain text in message event.
                
                text_chunk = chunk.text
                lines = text_chunk.strip().split('\n')
                
                for line in lines:
                    line = line.strip()
                    if not line: continue
                    
                    try:
                        # Try to parse as JSON to validate
                        json.loads(line)
                        yield line + "\n"
                    except json.JSONDecodeError:
                        # If not JSON, wrap it as a message
                        # This handles cases where Gemini might be chatty
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
