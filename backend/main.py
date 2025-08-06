import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from domain_identification import router as domain_router
from insights_generation import router as insights_router
from suggestions_generation import router as suggestions_router
from vector_database import router as vector_db_router
from ocr_extraction import router as ocr_router  # ✅ Add this


logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(ocr_router)
app.include_router(domain_router)
app.include_router(insights_router)
app.include_router(suggestions_router)
app.include_router(vector_db_router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)