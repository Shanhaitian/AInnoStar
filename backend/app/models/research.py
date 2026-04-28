import enum
from datetime import datetime

from sqlalchemy import BigInteger, String, Text, Enum, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class ProjectStatus(str, enum.Enum):
    planning = "planning"
    active = "active"
    completed = "completed"


class Sentiment(str, enum.Enum):
    positive = "positive"
    neutral = "neutral"
    negative = "negative"


class TagType(str, enum.Enum):
    feature = "feature"
    experience = "experience"
    bug = "bug"
    painpoint = "painpoint"


class ResearchProject(Base):
    __tablename__ = "research_projects"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    goal: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[ProjectStatus] = mapped_column(Enum(ProjectStatus), default=ProjectStatus.planning)
    owner_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("users.id"), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    interviews: Mapped[list["Interview"]] = relationship(back_populates="project", cascade="all, delete-orphan")


class Interview(Base):
    __tablename__ = "interviews"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    project_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("research_projects.id"), nullable=False)
    interviewee: Mapped[str] = mapped_column(String(128), nullable=False)
    transcript: Mapped[str | None] = mapped_column(Text, nullable=True)
    summary: Mapped[str | None] = mapped_column(Text, nullable=True)
    sentiment: Mapped[Sentiment | None] = mapped_column(Enum(Sentiment), nullable=True)
    audio_url: Mapped[str | None] = mapped_column(String(512), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    project: Mapped["ResearchProject"] = relationship(back_populates="interviews")
    insights: Mapped[list["InsightTag"]] = relationship(back_populates="interview", cascade="all, delete-orphan")


class InsightTag(Base):
    __tablename__ = "insight_tags"

    id: Mapped[int] = mapped_column(BigInteger, primary_key=True, autoincrement=True)
    interview_id: Mapped[int] = mapped_column(BigInteger, ForeignKey("interviews.id"), nullable=False)
    tag_type: Mapped[TagType] = mapped_column(Enum(TagType), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    requirement_id: Mapped[int | None] = mapped_column(BigInteger, ForeignKey("requirements.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())

    interview: Mapped["Interview"] = relationship(back_populates="insights")
