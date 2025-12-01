from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import json
import asyncio
import random

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AG-UI Backend is running"}

async def event_generator(user_message: str):
    # Simulate processing time
    await asyncio.sleep(0.5)
    
    # 1. Send a text message response
    yield json.dumps({
        "type": "message",
        "role": "assistant",
        "content": f"I received your request: '{user_message}'. Let me find the best UI for you."
    }) + "\n"
    
    await asyncio.sleep(1)

    # 2. Decide which UI to show based on keywords
    user_message_lower = user_message.lower()
    
    if "table" in user_message_lower:
        yield json.dumps({
            "type": "message",
            "role": "assistant",
            "content": "Here is the data in a table format:"
        }) + "\n"
        yield json.dumps({
            "type": "update_ui",
            "component": "table",
            "props": {
                "headers": ["Name", "Role", "Status"],
                "data": [
                    ["Alice", "Engineer", "Active"],
                    ["Bob", "Designer", "Away"],
                    ["Charlie", "Manager", "Active"]
                ]
            }
        }) + "\n"
        
    elif "form" in user_message_lower:
        yield json.dumps({
            "type": "message",
            "role": "assistant",
            "content": "Please fill out this form:"
        }) + "\n"
        yield json.dumps({
            "type": "update_ui",
            "component": "form",
            "props": {
                "title": "User Registration",
                "fields": [
                    {"name": "username", "label": "Username", "type": "text"},
                    {"name": "email", "label": "Email", "type": "email"}
                ]
            }
        }) + "\n"
        
    elif "card" in user_message_lower:
        yield json.dumps({
            "type": "message",
            "role": "assistant",
            "content": "Here is the user profile:"
        }) + "\n"
        yield json.dumps({
            "type": "update_ui",
            "component": "card",
            "props": {
                "title": "Alice Johnson",
                "description": "Senior Software Engineer",
                "imageUrl": "https://api.dicebear.com/7.x/avataaars/svg?seed=Alice"
            }
        }) + "\n"
        
    else:
        yield json.dumps({
            "type": "message",
            "role": "assistant",
            "content": "I can show you a 'table', 'form', or 'card'. Just ask!"
        }) + "\n"

@app.post("/agent")
async def agent_endpoint(request: Request):
    body = await request.json()
    user_message = body.get("message", "")
    return StreamingResponse(event_generator(user_message), media_type="application/x-ndjson")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
