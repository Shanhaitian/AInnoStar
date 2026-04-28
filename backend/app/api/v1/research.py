from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.research import ResearchProject, Interview, InsightTag
from app.schemas.research import ProjectCreate, ProjectOut, InterviewCreate, InterviewOut, InsightTagOut
from app.api.deps import get_current_user

router = APIRouter(prefix="/research", tags=["research"])


# ---- Research Projects ----
@router.post("/projects", response_model=ProjectOut, status_code=201)
def create_project(body: ProjectCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = ResearchProject(name=body.name, goal=body.goal, owner_id=user.id)
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.get("/projects", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(ResearchProject).order_by(ResearchProject.created_at.desc()).all()


@router.get("/projects/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    project = db.query(ResearchProject).filter(ResearchProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


# ---- Interviews ----
@router.post("/interviews", response_model=InterviewOut, status_code=201)
def create_interview(body: InterviewCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    interview = Interview(project_id=body.project_id, interviewee=body.interviewee)
    db.add(interview)
    db.commit()
    db.refresh(interview)
    return interview


@router.get("/interviews", response_model=list[InterviewOut])
def list_interviews(project_id: int | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(Interview)
    if project_id:
        q = q.filter(Interview.project_id == project_id)
    return q.order_by(Interview.created_at.desc()).all()


@router.post("/interviews/{interview_id}/transcribe", response_model=InterviewOut)
def transcribe_interview(interview_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    interview = db.query(Interview).filter(Interview.id == interview_id).first()
    if not interview:
        raise HTTPException(status_code=404, detail="Interview not found")
    # Placeholder: AI transcription logic will be added in ai_service
    interview.transcript = interview.transcript or "[AI transcription placeholder]"
    interview.summary = interview.summary or "[AI summary placeholder]"
    db.commit()
    db.refresh(interview)
    return interview


# ---- Insight Tags ----
@router.get("/insights", response_model=list[InsightTagOut])
def list_insights(interview_id: int | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(InsightTag)
    if interview_id:
        q = q.filter(InsightTag.interview_id == interview_id)
    return q.order_by(InsightTag.created_at.desc()).all()
