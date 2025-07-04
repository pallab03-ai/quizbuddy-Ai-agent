from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import os
import json
import asyncio
import re

app = FastAPI()

from langchain_openai import ChatOpenAI
from dotenv import load_dotenv
load_dotenv()
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY", "your_nvidia_api_key")
NVIDIA_BASE_URL = os.getenv("NVIDIA_BASE_URL", "https://integrate.api.nvidia.com/v1")

model = ChatOpenAI(
    model="nvidia/llama-3.3-nemotron-super-49b-v1",
    api_key=NVIDIA_API_KEY,
    base_url=NVIDIA_BASE_URL,
    temperature=0.5,
    request_timeout=30
)

class QuizRequest(BaseModel):
    num_questions: int
    topic: str

class Question(BaseModel):
    question: str
    options: List[str]
    answer: int

class QuizResponse(BaseModel):
    questions: List[Question]

class ChatRequest(BaseModel):
    quiz: dict
    user_answers: Optional[List[int]] = None
    question: Optional[str] = None
    user_message: str
    history: Optional[List[dict]] = None  # [{"role": "user"|"bot", "text": str}]

class ChatResponse(BaseModel):
    response: str

@app.post("/generate-quiz", response_model=QuizResponse)
async def generate_quiz(req: QuizRequest):
    print(f"[DEBUG] Received request: topic={req.topic}, num_questions={req.num_questions}")
    prompt = (
        f"Generate exactly {req.num_questions} multiple choice questions about {req.topic}. "
        "Format as JSON: [{\"question\": \"...\", \"options\": [\"A\",\"B\",\"C\",\"D\"], \"answer\": 0}]. "
        "Only output the JSON array, nothing else."
    )
    print(f"[DEBUG] Prompt to LLM: {prompt}")
    try:
        print("[DEBUG] NVIDIA_API_KEY:", NVIDIA_API_KEY)
        print("[DEBUG] NVIDIA_BASE_URL:", NVIDIA_BASE_URL)
        # Use synchronous call for debugging
        result = model.invoke(prompt)
        print("[DEBUG] LLM sync output:", result.content)
        match = re.search(r"\[.*\]", result.content, re.DOTALL)
        if match:
            print("[DEBUG] JSON match found, parsing...")
            questions_json = json.loads(match.group(0))
            questions = []
            for q in questions_json[:req.num_questions]:
                print(f"[DEBUG] Parsed question: {q}")
                questions.append(Question(
                    question=q["question"],
                    options=q["options"][:4],
                    answer=min(3, max(0, q["answer"]))
                ))
            print(f"[DEBUG] Returning {len(questions)} questions.")
            return QuizResponse(questions=questions)
        else:
            print(f"[DEBUG] No JSON array found in LLM output: {result.content}")
            raise HTTPException(status_code=500, detail=f"LLM raw output: {result.content}")
    except Exception as e:
        print(f"[DEBUG] Error in generate_quiz: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    # Build chat history string for context
    history_str = ""
    if req.history:
        for msg in req.history:
            if msg.get("role") == "user":
                history_str += f"User: {msg.get('text','')}\n"
            elif msg.get("role") == "bot":
                history_str += f"AI: {msg.get('text','')}\n"
    prompt = (
        f"Quiz context: {req.quiz}\n"
        f"Chat history so far:\n{history_str}"
        f"User's message: {req.user_message}\n"
        "Provide a brief, clear, and helpful response. Format as JSON: {\"response\": \"...\"}. Only output the JSON object, nothing else."
    )
    try:
        result = await asyncio.wait_for(model.ainvoke(prompt), timeout=30.0)
        print("LLM raw output (chat):", result.content)
        # Extract JSON object from the output using regex
        match = re.search(r"\{.*\}", result.content, re.DOTALL)
        if match:
            response_json = json.loads(match.group(0))
            return ChatResponse(response=response_json["response"])
        else:
            raise HTTPException(status_code=500, detail=f"LLM raw output: {result.content}")
    except asyncio.TimeoutError:
        raise HTTPException(status_code=408, detail="Request timeout - try again")
    except Exception as e:
        print(f"Error in chat: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
def root():
    return {"message": "AI Agent is running!"}