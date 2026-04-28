from datetime import datetime
from pydantic import BaseModel

from app.models.research import ProjectStatus, Sentiment, TagType


# --- Research Project ---
class ProjectCreate(BaseModel):
    name: str
    goal: str | None = None


class ProjectOut(BaseModel):
    id: int
    name: str
    goal: str | None = None
    status: ProjectStatus
    owner_id: int
    created_at: datetime
    model_config = {"from_attributes": True}


# --- Interview ---
class InterviewCreate(BaseModel):
    project_id: int
    interviewee: str


class InterviewOut(BaseModel):
    id: int
    project_id: int
    interviewee: str
    transcript: str | None = None
    summary: str | None = None
    sentiment: Sentiment | None = None
    audio_url: str | None = None
    created_at: datetime
    model_config = {"from_attributes": True}


# --- Insight Tag ---
class InsightTagOut(BaseModel):
    id: int
    interview_id: int
    tag_type: TagType
    content: str
    requirement_id: int | None = None
    created_at: datetime
    model_config = {"from_attributes": True}
