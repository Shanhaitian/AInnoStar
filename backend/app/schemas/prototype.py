from datetime import datetime
from pydantic import BaseModel

from app.models.prototype import GenerationPath, PrototypeStatus, PageStatus, NoteType


class PrototypeCreate(BaseModel):
    prd_id: int
    name: str
    generation_path: GenerationPath = GenerationPath.agent
    preview_url: str | None = None


class PrototypeUpdate(BaseModel):
    name: str | None = None
    preview_url: str | None = None
    status: PrototypeStatus | None = None


class PrototypeOut(BaseModel):
    id: int
    prd_id: int
    name: str
    generation_path: GenerationPath
    status: PrototypeStatus
    preview_url: str | None = None
    sitemap_json: dict | None = None
    created_at: datetime
    model_config = {"from_attributes": True}


class PrototypePageOut(BaseModel):
    id: int
    prototype_id: int
    page_name: str
    route_path: str | None = None
    html_content: str | None = None
    status: PageStatus
    sort_order: int
    created_at: datetime
    model_config = {"from_attributes": True}


class PrototypeNoteCreate(BaseModel):
    content: str
    note_type: NoteType = NoteType.meeting


class PrototypeNoteOut(BaseModel):
    id: int
    prototype_id: int
    content: str
    note_type: NoteType
    created_at: datetime
    model_config = {"from_attributes": True}
