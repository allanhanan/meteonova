from pathlib import Path
from dotenv import load_dotenv

# Try root .env, backend .env, or default fallback
root_env = Path(__file__).resolve().parent.parent.parent / ".env"
backend_env = Path(__file__).resolve().parent.parent / ".env"

if root_env.exists():
    load_dotenv(root_env)
if backend_env.exists():
    load_dotenv(backend_env)
load_dotenv()

class Settings:
    GROQ_API_KEY: str = os.getenv("GROQ_API_KEY", "")
    ELEVENLABS_API_KEY: str = os.getenv("ELEVENLABS_API_KEY", "")
    MAPTILER_API_KEY: str = os.getenv("MAPTILER_API_KEY", "")
    OPEN_METEO_BASE_URL: str = "https://api.open-meteo.com/v1"
    NASA_POWER_BASE_URL: str = "https://power.larc.nasa.gov/api/temporal/daily/point"
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

settings = Settings()
