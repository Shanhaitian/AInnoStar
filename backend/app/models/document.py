import enum
from datetime import datetime

from sqlalchemy import BigInteger, String, Text, Enum, DateTime, Integer, Float, ForeignKey, func, Table, Column
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


# ── Enums ──────────────────────────────────────────────────────────────────

class RequirementSource(str, enum.Enum):
    insight = "insight"
    feedback = "feedback"
    internal = "internal"
    competitor = "competitor"
    customer = "customer"


class Priority(str, enum.Enum):
    P0 = "P0"
    P1 = "P1"
    P2 = "P2"


class RequirementStatus(str, enum.Enum):
    draft = "draft"
    approved = "approved"
    in_dev = "in_dev"
    done = "done"


class PRDStatus(str, enum.Enum):
    draft = "draft"
    review = "review"
    published = "published"
    locked = "locked"


class TemplateType(str, enum.Enum):
    agile = "agile"
    standard = "standard"
    detailed = "detailed"


class DocStatus(str, enum.Enum):
    draft = "draft"
    review = "review"
    approved = "approved"
    published = "published"


class DocDirection(str, enum.Enum):
    inbound = "inbound"    # 客户提供 → 我方
    outbound = "outbound"  # 我方提交 → 客户


# ── Association Table ──────────────────────────────────────────────────────

prd_requirements = Table(
    "prd_requirements",
    Base.metadata,
    Column("prd_id", BigInteger, ForeignKey("prd_documents.id"), primary_key=True),
    Column("requirement_id", BigInteger, ForeignKey("requirements.id"), primary_key=True),
)


# ── Project ────────────────────────────────────────────────────────────────

class Project(Base):
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    code: Mapped[str | None] = mapped_column(String(32), unique=True, nullable=True, comment="项目编号")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    client_name: Mapped[str | None] = mapped_column(String(128), nullable=True, comment="客户名称")
    status: Mapped[str] = mapped_column(String(16), default="active", comment="active/archived")
    owner_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    requirements: Mapped[list["Requirement"]] = relationship(back_populates="project")
    prds: Mapped[list["PRDDocument"]] = relationship(back_populates="project")
    tech_docs: Mapped[list["TechnicalDocument"]] = relationship(back_populates="project")
    customer_docs: Mapped[list["CustomerDocument"]] = relationship(back_populates="project")


# ── Requirement ────────────────────────────────────────────────────────────

class Requirement(Base):
    __tablename__ = "requirements"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    project_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("projects.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    user_story: Mapped[str | None] = mapped_column(Text, nullable=True)
    acceptance_criteria: Mapped[str | None] = mapped_column(Text, nullable=True)
    source: Mapped[RequirementSource] = mapped_column(Enum(RequirementSource), default=RequirementSource.internal)
    source_id: Mapped[int | None] = mapped_column(BigInteger, nullable=True)
    priority: Mapped[Priority] = mapped_column(Enum(Priority), default=Priority.P2)
    status: Mapped[RequirementStatus] = mapped_column(Enum(RequirementStatus), default=RequirementStatus.draft)
    rice_score: Mapped[float | None] = mapped_column(Float, nullable=True)
    created_by: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    project: Mapped["Project | None"] = relationship(back_populates="requirements")
    prds: Mapped[list["PRDDocument"]] = relationship(secondary=prd_requirements, back_populates="requirements")


# ── PRD ────────────────────────────────────────────────────────────────────

class PRDDocument(Base):
    __tablename__ = "prd_documents"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    project_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("projects.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    content: Mapped[str | None] = mapped_column(Text, nullable=True, comment="Markdown 全文")
    # 结构化章节
    section_background: Mapped[str | None] = mapped_column(Text, nullable=True)
    section_goals: Mapped[str | None] = mapped_column(Text, nullable=True)
    section_users: Mapped[str | None] = mapped_column(Text, nullable=True)
    section_features: Mapped[str | None] = mapped_column(Text, nullable=True)
    section_flow: Mapped[str | None] = mapped_column(Text, nullable=True)
    section_acceptance: Mapped[str | None] = mapped_column(Text, nullable=True)
    section_nonfunc: Mapped[str | None] = mapped_column(Text, nullable=True)
    template_type: Mapped[TemplateType] = mapped_column(Enum(TemplateType), default=TemplateType.standard)
    status: Mapped[PRDStatus] = mapped_column(Enum(PRDStatus), default=PRDStatus.draft)
    version: Mapped[int] = mapped_column(Integer, default=1)
    created_by: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    project: Mapped["Project | None"] = relationship(back_populates="prds")
    requirements: Mapped[list["Requirement"]] = relationship(secondary=prd_requirements, back_populates="prds")
    versions: Mapped[list["PRDVersion"]] = relationship(back_populates="prd", cascade="all, delete-orphan")


class PRDVersion(Base):
    __tablename__ = "prd_versions"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    prd_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("prd_documents.id"), nullable=False)
    version: Mapped[int] = mapped_column(Integer, nullable=False)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    change_summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_by: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    prd: Mapped["PRDDocument"] = relationship(back_populates="versions")


# ── Technical Document ─────────────────────────────────────────────────────

class TechnicalDocument(Base):
    __tablename__ = "technical_documents"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("projects.id"), nullable=False)
    prd_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("prd_documents.id"), nullable=True)
    doc_type: Mapped[str] = mapped_column(String(32), nullable=False, comment="solution/api/database/deployment")
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[DocStatus] = mapped_column(Enum(DocStatus), default=DocStatus.draft)
    created_by: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    project: Mapped["Project"] = relationship(back_populates="tech_docs")


# ── Customer Document ──────────────────────────────────────────────────────

class CustomerDocument(Base):
    __tablename__ = "customer_documents"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("projects.id"), nullable=False)
    direction: Mapped[DocDirection] = mapped_column(Enum(DocDirection), nullable=False)
    category: Mapped[str] = mapped_column(String(32), nullable=False, comment="requirement/material/deliverable/meeting/contract")
    title: Mapped[str] = mapped_column(String(256), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    file_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    status: Mapped[DocStatus] = mapped_column(Enum(DocStatus), default=DocStatus.draft)
    created_by: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    project: Mapped["Project"] = relationship(back_populates="customer_docs")
