from datetime import datetime
from pydantic import BaseModel

from app.models.document import (
    RequirementSource, Priority, RequirementStatus,
    PRDStatus, TemplateType, DocStatus, DocDirection,
)


# ── Project ────────────────────────────────────────────────────────────────

class ProjectCreate(BaseModel):
    name: str
    code: str | None = None
    description: str | None = None
    client_name: str | None = None


class ProjectUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    client_name: str | None = None
    status: str | None = None


class ProjectOut(BaseModel):
    id: int
    name: str
    code: str | None = None
    description: str | None = None
    client_name: str | None = None
    status: str
    owner_id: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


# ── Requirement ────────────────────────────────────────────────────────────

class RequirementCreate(BaseModel):
    title: str
    description: str | None = None
    user_story: str | None = None
    acceptance_criteria: str | None = None
    source: RequirementSource = RequirementSource.internal
    source_id: int | None = None
    priority: Priority = Priority.P2
    project_id: int | None = None


class RequirementUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    user_story: str | None = None
    acceptance_criteria: str | None = None
    priority: Priority | None = None
    status: RequirementStatus | None = None
    rice_score: float | None = None
    project_id: int | None = None


class RequirementOut(BaseModel):
    id: int
    project_id: int | None = None
    title: str
    description: str | None = None
    user_story: str | None = None
    acceptance_criteria: str | None = None
    source: RequirementSource
    priority: Priority
    status: RequirementStatus
    rice_score: float | None = None
    created_by: int
    created_at: datetime
    model_config = {"from_attributes": True}


# ── PRD ────────────────────────────────────────────────────────────────────

class PRDCreate(BaseModel):
    title: str
    template_type: TemplateType = TemplateType.standard
    project_id: int | None = None
    requirement_ids: list[int] = []


class PRDUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    section_background: str | None = None
    section_goals: str | None = None
    section_users: str | None = None
    section_features: str | None = None
    section_flow: str | None = None
    section_acceptance: str | None = None
    section_nonfunc: str | None = None
    status: PRDStatus | None = None


class PRDOut(BaseModel):
    id: int
    project_id: int | None = None
    title: str
    content: str | None = None
    section_background: str | None = None
    section_goals: str | None = None
    section_users: str | None = None
    section_features: str | None = None
    section_flow: str | None = None
    section_acceptance: str | None = None
    section_nonfunc: str | None = None
    template_type: TemplateType
    status: PRDStatus
    version: int
    created_by: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


class PRDVersionOut(BaseModel):
    id: int
    prd_id: int
    version: int
    content: str | None = None
    change_summary: str | None = None
    created_by: int | None = None
    created_at: datetime
    model_config = {"from_attributes": True}


# ── Technical Document ─────────────────────────────────────────────────────

class TechDocCreate(BaseModel):
    project_id: int
    prd_id: int | None = None
    doc_type: str  # solution / api / database / deployment
    title: str
    content: str | None = None


class TechDocUpdate(BaseModel):
    title: str | None = None
    content: str | None = None
    doc_type: str | None = None
    status: DocStatus | None = None


class TechDocOut(BaseModel):
    id: int
    project_id: int
    prd_id: int | None = None
    doc_type: str
    title: str
    content: str | None = None
    status: DocStatus
    created_by: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}


# ── Customer Document ──────────────────────────────────────────────────────

class CustomerDocCreate(BaseModel):
    project_id: int
    direction: DocDirection
    category: str  # requirement / material / deliverable / meeting / contract
    title: str
    description: str | None = None
    file_url: str | None = None


class CustomerDocUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    category: str | None = None
    file_url: str | None = None
    status: DocStatus | None = None


class CustomerDocOut(BaseModel):
    id: int
    project_id: int
    direction: DocDirection
    category: str
    title: str
    description: str | None = None
    file_url: str | None = None
    status: DocStatus
    created_by: int
    created_at: datetime
    updated_at: datetime
    model_config = {"from_attributes": True}
