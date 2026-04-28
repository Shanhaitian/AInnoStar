from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.research import router as research_router
from app.api.v1.document import router as document_router
from app.api.v1.prototype import router as prototype_router

api_v1_router = APIRouter(prefix="/api/v1")
api_v1_router.include_router(auth_router)
api_v1_router.include_router(research_router)
api_v1_router.include_router(document_router)
api_v1_router.include_router(prototype_router)
