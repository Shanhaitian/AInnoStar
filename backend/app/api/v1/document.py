from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.document import (
    Project, Requirement, PRDDocument, PRDVersion, prd_requirements,
    TechnicalDocument, CustomerDocument,
)
from app.schemas.document import (
    ProjectCreate, ProjectUpdate, ProjectOut,
    RequirementCreate, RequirementUpdate, RequirementOut,
    PRDCreate, PRDUpdate, PRDOut, PRDVersionOut,
    TechDocCreate, TechDocUpdate, TechDocOut,
    CustomerDocCreate, CustomerDocUpdate, CustomerDocOut,
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/documents", tags=["documents"])


# ══════════════════════════════════════════════════════════════════════════
#  Projects
# ══════════════════════════════════════════════════════════════════════════

@router.post("/projects", response_model=ProjectOut, status_code=201)
def create_project(body: ProjectCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    proj = Project(name=body.name, code=body.code, description=body.description,
                   client_name=body.client_name, owner_id=user.id)
    db.add(proj)
    db.commit()
    db.refresh(proj)
    return proj


@router.get("/projects", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Project).order_by(Project.created_at.desc()).all()


@router.get("/projects/{proj_id}", response_model=ProjectOut)
def get_project(proj_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    proj = db.query(Project).filter(Project.id == proj_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    return proj


@router.put("/projects/{proj_id}", response_model=ProjectOut)
def update_project(proj_id: int, body: ProjectUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    proj = db.query(Project).filter(Project.id == proj_id).first()
    if not proj:
        raise HTTPException(status_code=404, detail="Project not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(proj, field, value)
    db.commit()
    db.refresh(proj)
    return proj


# ══════════════════════════════════════════════════════════════════════════
#  Requirements
# ══════════════════════════════════════════════════════════════════════════

@router.post("/requirements", response_model=RequirementOut, status_code=201)
def create_requirement(body: RequirementCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    req = Requirement(
        title=body.title, description=body.description, user_story=body.user_story,
        acceptance_criteria=body.acceptance_criteria, source=body.source, source_id=body.source_id,
        priority=body.priority, project_id=body.project_id, created_by=user.id,
    )
    db.add(req)
    db.commit()
    db.refresh(req)
    return req


@router.get("/requirements", response_model=list[RequirementOut])
def list_requirements(
    priority: str | None = None,
    status: str | None = None,
    source: str | None = None,
    project_id: int | None = None,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = db.query(Requirement)
    if priority:
        q = q.filter(Requirement.priority == priority)
    if status:
        q = q.filter(Requirement.status == status)
    if source:
        q = q.filter(Requirement.source == source)
    if project_id:
        q = q.filter(Requirement.project_id == project_id)
    return q.order_by(Requirement.created_at.desc()).all()


@router.put("/requirements/{req_id}", response_model=RequirementOut)
def update_requirement(req_id: int, body: RequirementUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    req = db.query(Requirement).filter(Requirement.id == req_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Requirement not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(req, field, value)
    db.commit()
    db.refresh(req)
    return req


# ══════════════════════════════════════════════════════════════════════════
#  PRD
# ══════════════════════════════════════════════════════════════════════════

@router.post("/prd", response_model=PRDOut, status_code=201)
def create_prd(body: PRDCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    prd = PRDDocument(title=body.title, template_type=body.template_type,
                      project_id=body.project_id, created_by=user.id)
    db.add(prd)
    db.flush()
    for rid in body.requirement_ids:
        db.execute(prd_requirements.insert().values(prd_id=prd.id, requirement_id=rid))
    db.add(PRDVersion(prd_id=prd.id, version=1, content="", change_summary="创建文档", created_by=user.id))
    db.commit()
    db.refresh(prd)
    return prd


@router.get("/prd", response_model=list[PRDOut])
def list_prds(project_id: int | None = None, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(PRDDocument)
    if project_id:
        q = q.filter(PRDDocument.project_id == project_id)
    return q.order_by(PRDDocument.updated_at.desc()).all()


@router.get("/prd/{prd_id}", response_model=PRDOut)
def get_prd(prd_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    prd = db.query(PRDDocument).filter(PRDDocument.id == prd_id).first()
    if not prd:
        raise HTTPException(status_code=404, detail="PRD not found")
    return prd


@router.put("/prd/{prd_id}", response_model=PRDOut)
def update_prd(prd_id: int, body: PRDUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    prd = db.query(PRDDocument).filter(PRDDocument.id == prd_id).first()
    if not prd:
        raise HTTPException(status_code=404, detail="PRD not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(prd, field, value)
    db.commit()
    db.refresh(prd)
    return prd


@router.post("/prd/{prd_id}/generate", response_model=PRDOut)
def generate_prd_content(prd_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    prd = db.query(PRDDocument).filter(PRDDocument.id == prd_id).first()
    if not prd:
        raise HTTPException(status_code=404, detail="PRD not found")
    # Placeholder: AI fills structured sections
    if not prd.section_background:
        prd.section_background = "## 背景\n\n[AI 自动生成]"
    if not prd.section_goals:
        prd.section_goals = "## 目标\n\n[AI 自动生成]"
    if not prd.section_features:
        reqs = db.query(Requirement).filter(Requirement.id.in_(
            [r.id for r in prd.requirements]
        )).all() if prd.requirements else []
        lines = "\n".join(f"- {r.title}: {r.description or ''}" for r in reqs) or "- [请先关联需求]"
        prd.section_features = f"## 功能清单\n\n{lines}"
    if not prd.content:
        sections = [prd.section_background, prd.section_goals, prd.section_features,
                     prd.section_flow or "", prd.section_acceptance or "", prd.section_nonfunc or ""]
        prd.content = "\n\n".join(s for s in sections if s)
    db.add(PRDVersion(prd_id=prd.id, version=prd.version + 1, content=prd.content,
                      change_summary="AI 生成内容", created_by=user.id))
    prd.version += 1
    db.commit()
    db.refresh(prd)
    return prd


@router.get("/prd/{prd_id}/versions", response_model=list[PRDVersionOut])
def list_prd_versions(prd_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(PRDVersion).filter(PRDVersion.prd_id == prd_id).order_by(PRDVersion.version.desc()).all()


# ══════════════════════════════════════════════════════════════════════════
#  Technical Documents
# ══════════════════════════════════════════════════════════════════════════

@router.post("/tech-docs", response_model=TechDocOut, status_code=201)
def create_tech_doc(body: TechDocCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    doc = TechnicalDocument(project_id=body.project_id, prd_id=body.prd_id,
                            doc_type=body.doc_type, title=body.title,
                            content=body.content, created_by=user.id)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/tech-docs", response_model=list[TechDocOut])
def list_tech_docs(project_id: int | None = None, doc_type: str | None = None,
                   db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(TechnicalDocument)
    if project_id:
        q = q.filter(TechnicalDocument.project_id == project_id)
    if doc_type:
        q = q.filter(TechnicalDocument.doc_type == doc_type)
    return q.order_by(TechnicalDocument.updated_at.desc()).all()


@router.get("/tech-docs/{doc_id}", response_model=TechDocOut)
def get_tech_doc(doc_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    doc = db.query(TechnicalDocument).filter(TechnicalDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Tech doc not found")
    return doc


@router.put("/tech-docs/{doc_id}", response_model=TechDocOut)
def update_tech_doc(doc_id: int, body: TechDocUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    doc = db.query(TechnicalDocument).filter(TechnicalDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Tech doc not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(doc, field, value)
    db.commit()
    db.refresh(doc)
    return doc


# ══════════════════════════════════════════════════════════════════════════
#  Customer Documents
# ══════════════════════════════════════════════════════════════════════════

@router.post("/customer-docs", response_model=CustomerDocOut, status_code=201)
def create_customer_doc(body: CustomerDocCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    doc = CustomerDocument(project_id=body.project_id, direction=body.direction,
                           category=body.category, title=body.title,
                           description=body.description, file_url=body.file_url,
                           created_by=user.id)
    db.add(doc)
    db.commit()
    db.refresh(doc)
    return doc


@router.get("/customer-docs", response_model=list[CustomerDocOut])
def list_customer_docs(project_id: int | None = None, direction: str | None = None,
                       db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    q = db.query(CustomerDocument)
    if project_id:
        q = q.filter(CustomerDocument.project_id == project_id)
    if direction:
        q = q.filter(CustomerDocument.direction == direction)
    return q.order_by(CustomerDocument.created_at.desc()).all()


@router.get("/customer-docs/{doc_id}", response_model=CustomerDocOut)
def get_customer_doc(doc_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    doc = db.query(CustomerDocument).filter(CustomerDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Customer doc not found")
    return doc


@router.put("/customer-docs/{doc_id}", response_model=CustomerDocOut)
def update_customer_doc(doc_id: int, body: CustomerDocUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    doc = db.query(CustomerDocument).filter(CustomerDocument.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Customer doc not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(doc, field, value)
    db.commit()
    db.refresh(doc)
    return doc
