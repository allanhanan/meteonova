import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel

from app.config import settings
from app.services.open_meteo import OpenMeteoService
from app.services.alert_service import AlertService
from app.services.elevenlabs import ElevenLabsService
from app.agents.router import AgentRouter

app = FastAPI(
    title="MeteoNova API",
    description="Backend API Gateway for WeatherGPT Generative Geospatial Digital Twin",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class QueryRequest(BaseModel):
    query: str
    lat: float = 19.0760
    lon: float = 72.8777

class TTSRequest(BaseModel):
    text: str
    voice_id: str = "21m00Tcm4TlvDq8ikWAM"

@app.get("/")
def read_root():
    return {"status": "ok", "app": "MeteoNova Backend Gateway", "version": "1.0.0"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": "MeteoNova Engine"}

@app.get("/api/alerts")
def get_alerts():
    """Endpoint to return active (mock/demo) weather alerts."""
    return {"alerts": AlertService.get_active_alerts()}

@app.get("/api/forecast")
async def get_forecast(lat: float = 19.0760, lon: float = 72.8777):
    """Proxy endpoint to fetch Open-Meteo weather data."""
    data = await OpenMeteoService.get_forecast(lat, lon)
    return data

@app.post("/api/chat")
async def chat_endpoint(req: QueryRequest):
    """HTTP endpoint for chat query processing."""
    result = await AgentRouter.process_user_query(req.query)
    return result

@app.post("/api/tts")
async def tts_endpoint(req: TTSRequest):
    """ElevenLabs TTS proxy endpoint."""
    audio_bytes = await ElevenLabsService.generate_speech(req.text, req.voice_id)
    if audio_bytes:
        return Response(content=audio_bytes, media_type="audio/mpeg")
    return Response(status_code=204)

@app.websocket("/ws/chat")
async def websocket_chat(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            query = payload.get("query", "")
            
            result = await AgentRouter.process_user_query(query)
            await websocket.send_json(result)
    except WebSocketDisconnect:
        print("Client disconnected from WebSocket chat")
    except Exception as e:
        print(f"WebSocket error: {e}")
        await websocket.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
