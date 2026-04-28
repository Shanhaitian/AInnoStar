from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.user import User
from app.models.prototype import Prototype, PrototypePage, PrototypeNote
from app.schemas.prototype import (
    PrototypeCreate, PrototypeUpdate, PrototypeOut,
    PrototypePageOut, PrototypeNoteCreate, PrototypeNoteOut,
)
from app.api.deps import get_current_user

router = APIRouter(prefix="/prototypes", tags=["prototypes"])


@router.post("", response_model=PrototypeOut, status_code=201)
def create_prototype(body: PrototypeCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    proto = Prototype(
        prd_id=body.prd_id, name=body.name,
        generation_path=body.generation_path, preview_url=body.preview_url,
    )
    if body.generation_path == "local" and body.preview_url:
        proto.status = "preview"
    db.add(proto)
    db.commit()
    db.refresh(proto)
    return proto


@router.get("", response_model=list[PrototypeOut])
def list_prototypes(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(Prototype).order_by(Prototype.created_at.desc()).all()


@router.get("/{proto_id}", response_model=PrototypeOut)
def get_prototype(proto_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    proto = db.query(Prototype).filter(Prototype.id == proto_id).first()
    if not proto:
        raise HTTPException(status_code=404, detail="Prototype not found")
    return proto


@router.put("/{proto_id}", response_model=PrototypeOut)
def update_prototype(proto_id: int, body: PrototypeUpdate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    proto = db.query(Prototype).filter(Prototype.id == proto_id).first()
    if not proto:
        raise HTTPException(status_code=404, detail="Prototype not found")
    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(proto, field, value)
    db.commit()
    db.refresh(proto)
    return proto


@router.post("/{proto_id}/generate", response_model=PrototypeOut)
def generate_prototype(proto_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    proto = db.query(Prototype).filter(Prototype.id == proto_id).first()
    if not proto:
        raise HTTPException(status_code=404, detail="Prototype not found")
    if not proto.pages:
        for i, name in enumerate(["Home", "Detail", "Settings"]):
            db.add(PrototypePage(
                prototype_id=proto.id,
                page_name=name,
                route_path=f"/{name.lower()}",
                html_content=f"<div><h1>{name}</h1><p>[AI generated placeholder]</p></div>",
                sort_order=i,
            ))
    proto.status = "preview"
    db.commit()
    db.refresh(proto)
    return proto


@router.get("/{proto_id}/pages", response_model=list[PrototypePageOut])
def list_pages(proto_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(PrototypePage).filter(PrototypePage.prototype_id == proto_id).order_by(PrototypePage.sort_order).all()


# ── Notes ─────────────────────────────────────────────────────────────────

@router.post("/{proto_id}/notes", response_model=PrototypeNoteOut, status_code=201)
def create_note(proto_id: int, body: PrototypeNoteCreate, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    proto = db.query(Prototype).filter(Prototype.id == proto_id).first()
    if not proto:
        raise HTTPException(status_code=404, detail="Prototype not found")
    note = PrototypeNote(prototype_id=proto_id, content=body.content, note_type=body.note_type)
    db.add(note)
    db.commit()
    db.refresh(note)
    return note


@router.get("/{proto_id}/notes", response_model=list[PrototypeNoteOut])
def list_notes(proto_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return db.query(PrototypeNote).filter(PrototypeNote.prototype_id == proto_id).order_by(PrototypeNote.created_at.desc()).all()
