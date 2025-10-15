"""
Idea Burst Session model for managing idea generation sessions
"""

from datetime import datetime
from typing import Dict, List, Optional, Any
import uuid

Base = declarative_base()

class IdeaBurstSession:
    """Simple data class for IdeaBurstSession - use Supabase for database operations"""
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

class SelectedIdea(Base):
    """Model for selected ideas in a session"""
    
    # __tablename__ = "selected_ideas"
    
    # id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    # session_id = Column(String, ForeignKey("idea_burst_sessions.id"), nullable=False)
    # idea_id = Column(String, nullable=False)
    # idea_type = Column(String(20), nullable=False)  # blog, software
    # selection_notes = Column(Text, nullable=True)
    # priority = Column(String(20), nullable=False, default="medium")  # high, medium, low
    # selected_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    # session = relationship("IdeaBurstSession", back_populates="selected_ideas")
    
    def __repr__(self):
        return f"<SelectedIdea(id='{self.id}', idea_type='{self.idea_type}', priority='{self.priority}')>"
    
    def to_dict(self) -> dict:
        """Convert selected idea to dictionary"""
        return {
            "id": self.id,
            "session_id": self.session_id,
            "idea_id": self.idea_id,
            "idea_type": self.idea_type,
            "selection_notes": self.selection_notes,
            "priority": self.priority,
            "selected_at": self.selected_at.isoformat() if self.selected_at else None
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> "SelectedIdea":
        """Create selected idea from dictionary"""
        return cls(
            id=data.get("id", str(uuid.uuid4())),
            session_id=data["session_id"],
            idea_id=data["idea_id"],
            idea_type=data["idea_type"],
            selection_notes=data.get("selection_notes"),
            priority=data.get("priority", "medium")
        )

