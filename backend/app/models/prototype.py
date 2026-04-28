import enum
from datetime import datetime

from sqlalchemy import BigInteger, String, Text, Enum, DateTime, Integer, JSON, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class GenerationPath(str, enum.Enum):
    agent = "agent"
    mcp = "mcp"
    local = "local"


class PrototypeStatus(str, enum.Enum):
    generating = "generating"
    preview = "preview"
    exported = "exported"


class PageStatus(str, enum.Enum):
    generating = "generating"
    done = "done"
    error = "error"


class NoteType(str, enum.Enum):
    meeting = "meeting"
    annotation = "annotation"


class Prototype(Base):
    __tablename__ = "prototypes"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    prd_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("prd_documents.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    generation_path: Mapped[GenerationPath] = mapped_column(Enum(GenerationPath), default=GenerationPath.agent)
    status: Mapped[PrototypeStatus] = mapped_column(Enum(PrototypeStatus), default=PrototypeStatus.generating)
    preview_url: Mapped[str | None] = mapped_column(String(512), nullable=True, comment="本地项目预览地址")
    sitemap_json: Mapped[dict | None] = mapped_column(JSON, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    pages: Mapped[list["PrototypePage"]] = relationship(back_populates="prototype", cascade="all, delete-orphan")
    notes: Mapped[list["PrototypeNote"]] = relationship(back_populates="prototype", cascade="all, delete-orphan")


class PrototypePage(Base):
    __tablename__ = "prototype_pages"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    prototype_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("prototypes.id"), nullable=False)
    page_name: Mapped[str] = mapped_column(String(128), nullable=False)
    route_path: Mapped[str | None] = mapped_column(String(256), nullable=True)
    html_content: Mapped[str | None] = mapped_column(Text, nullable=True)
    prompt_used: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[PageStatus] = mapped_column(Enum(PageStatus), default=PageStatus.generating)
    sort_order: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    prototype: Mapped["Prototype"] = relationship(back_populates="pages")


class PrototypeNote(Base):
    __tablename__ = "prototype_notes"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    prototype_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("prototypes.id"), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    note_type: Mapped[NoteType] = mapped_column(Enum(NoteType), default=NoteType.meeting)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    prototype: Mapped["Prototype"] = relationship(back_populates="notes")
