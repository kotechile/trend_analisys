"""
Idea Burst Session model for managing idea generation sessions
"""

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Dict, List, Optional, Any
import uuid

Base = declarative_base()


class IdeaBurstSession(Base):
    """Model for Idea Burst sessions"""
    
    __tablename__ = "idea_burst_sessions"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    session_name = Column(String(255), nullable=False)
    session_type = Column(String(50), nullable=False)  # seed_keywords, ahrefs_enhanced, mixed
    
    # Session configuration
    seed_keywords = Column(JSON, nullable=True)  # List of seed keywords
    analysis_id = Column(String, ForeignKey("keyword_analysis_reports.id"), nullable=True)
    enhanced_with_ahrefs = Column(Boolean, nullable=False, default=False)
    
    # Session settings
    max_blog_ideas = Column(Integer, nullable=False, default=20)
    max_software_ideas = Column(Integer, nullable=False, default=10)
    include_software_ideas = Column(Boolean, nullable=False, default=True)
    
    # Session status
    status = Column(String(20), nullable=False, default="active")  # active, completed, archived
    progress_percentage = Column(Integer, nullable=False, default=0)
    
    # Generated ideas
    blog_ideas_count = Column(Integer, nullable=False, default=0)
    software_ideas_count = Column(Integer, nullable=False, default=0)
    total_ideas_count = Column(Integer, nullable=False, default=0)
    
    # Session metadata
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    last_activity_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    analysis_report = relationship("KeywordAnalysisReport", back_populates="idea_burst_sessions")
    selected_ideas = relationship("SelectedIdea", back_populates="session", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<IdeaBurstSession(id='{self.id}', session_name='{self.session_name}', status='{self.status}')>"
    
    def to_dict(self) -> dict:
        """Convert Idea Burst session to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "session_name": self.session_name,
            "session_type": self.session_type,
            "seed_keywords": self.seed_keywords,
            "analysis_id": self.analysis_id,
            "enhanced_with_ahrefs": self.enhanced_with_ahrefs,
            "max_blog_ideas": self.max_blog_ideas,
            "max_software_ideas": self.max_software_ideas,
            "include_software_ideas": self.include_software_ideas,
            "status": self.status,
            "progress_percentage": self.progress_percentage,
            "blog_ideas_count": self.blog_ideas_count,
            "software_ideas_count": self.software_ideas_count,
            "total_ideas_count": self.total_ideas_count,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "last_activity_at": self.last_activity_at.isoformat() if self.last_activity_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> "IdeaBurstSession":
        """Create Idea Burst session from dictionary"""
        return cls(
            id=data.get("id", str(uuid.uuid4())),
            user_id=data["user_id"],
            session_name=data["session_name"],
            session_type=data["session_type"],
            seed_keywords=data.get("seed_keywords"),
            analysis_id=data.get("analysis_id"),
            enhanced_with_ahrefs=data.get("enhanced_with_ahrefs", False),
            max_blog_ideas=data.get("max_blog_ideas", 20),
            max_software_ideas=data.get("max_software_ideas", 10),
            include_software_ideas=data.get("include_software_ideas", True),
            status=data.get("status", "active"),
            progress_percentage=data.get("progress_percentage", 0),
            blog_ideas_count=data.get("blog_ideas_count", 0),
            software_ideas_count=data.get("software_ideas_count", 0),
            total_ideas_count=data.get("total_ideas_count", 0)
        )
    
    def is_active(self) -> bool:
        """Check if session is active"""
        return self.status == "active"
    
    def is_completed(self) -> bool:
        """Check if session is completed"""
        return self.status == "completed"
    
    def is_archived(self) -> bool:
        """Check if session is archived"""
        return self.status == "archived"
    
    def get_session_duration(self) -> Optional[float]:
        """Get session duration in seconds"""
        if self.started_at and self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        elif self.started_at:
            return (datetime.utcnow() - self.started_at).total_seconds()
        return None
    
    def update_progress(self, blog_count: int, software_count: int):
        """Update session progress"""
        self.blog_ideas_count = blog_count
        self.software_ideas_count = software_count
        self.total_ideas_count = blog_count + software_count
        
        # Calculate progress percentage
        total_expected = self.max_blog_ideas
        if self.include_software_ideas:
            total_expected += self.max_software_ideas
        
        if total_expected > 0:
            self.progress_percentage = min(100, int((self.total_ideas_count / total_expected) * 100))
        
        self.last_activity_at = datetime.utcnow()
    
    def mark_completed(self):
        """Mark session as completed"""
        self.status = "completed"
        self.completed_at = datetime.utcnow()
        self.progress_percentage = 100
    
    def archive_session(self):
        """Archive the session"""
        self.status = "archived"
        self.updated_at = datetime.utcnow()
    
    def reactivate_session(self):
        """Reactivate the session"""
        self.status = "active"
        self.updated_at = datetime.utcnow()
    
    def get_session_summary(self) -> Dict[str, Any]:
        """Get session summary"""
        return {
            "id": self.id,
            "session_name": self.session_name,
            "session_type": self.session_type,
            "status": self.status,
            "progress_percentage": self.progress_percentage,
            "blog_ideas_count": self.blog_ideas_count,
            "software_ideas_count": self.software_ideas_count,
            "total_ideas_count": self.total_ideas_count,
            "enhanced_with_ahrefs": self.enhanced_with_ahrefs,
            "session_duration": self.get_session_duration(),
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }
    
    def get_configuration(self) -> Dict[str, Any]:
        """Get session configuration"""
        return {
            "max_blog_ideas": self.max_blog_ideas,
            "max_software_ideas": self.max_software_ideas,
            "include_software_ideas": self.include_software_ideas,
            "seed_keywords": self.seed_keywords,
            "analysis_id": self.analysis_id,
            "enhanced_with_ahrefs": self.enhanced_with_ahrefs
        }
    
    def update_configuration(self, config: Dict[str, Any]):
        """Update session configuration"""
        if "max_blog_ideas" in config:
            self.max_blog_ideas = config["max_blog_ideas"]
        if "max_software_ideas" in config:
            self.max_software_ideas = config["max_software_ideas"]
        if "include_software_ideas" in config:
            self.include_software_ideas = config["include_software_ideas"]
        if "seed_keywords" in config:
            self.seed_keywords = config["seed_keywords"]
        
        self.updated_at = datetime.utcnow()
    
    def is_ready_for_generation(self) -> bool:
        """Check if session is ready for idea generation"""
        if self.session_type == "seed_keywords":
            return bool(self.seed_keywords and len(self.seed_keywords) > 0)
        elif self.session_type == "ahrefs_enhanced":
            return bool(self.analysis_id)
        elif self.session_type == "mixed":
            return bool(self.seed_keywords or self.analysis_id)
        return False
    
    def get_generation_requirements(self) -> Dict[str, Any]:
        """Get requirements for idea generation"""
        requirements = {
            "session_type": self.session_type,
            "needs_seed_keywords": False,
            "needs_analysis_id": False,
            "is_ready": self.is_ready_for_generation()
        }
        
        if self.session_type in ["seed_keywords", "mixed"]:
            requirements["needs_seed_keywords"] = True
            requirements["has_seed_keywords"] = bool(self.seed_keywords)
        
        if self.session_type in ["ahrefs_enhanced", "mixed"]:
            requirements["needs_analysis_id"] = True
            requirements["has_analysis_id"] = bool(self.analysis_id)
        
        return requirements
    
    def get_export_data(self) -> Dict[str, Any]:
        """Get data for export"""
        return {
            "id": self.id,
            "session_name": self.session_name,
            "session_type": self.session_type,
            "status": self.status,
            "progress_percentage": self.progress_percentage,
            "blog_ideas_count": self.blog_ideas_count,
            "software_ideas_count": self.software_ideas_count,
            "total_ideas_count": self.total_ideas_count,
            "enhanced_with_ahrefs": self.enhanced_with_ahrefs,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "session_duration": self.get_session_duration()
        }


class SelectedIdea(Base):
    """Model for selected ideas in a session"""
    
    __tablename__ = "selected_ideas"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("idea_burst_sessions.id"), nullable=False)
    idea_id = Column(String, nullable=False)
    idea_type = Column(String(20), nullable=False)  # blog, software
    selection_notes = Column(Text, nullable=True)
    priority = Column(String(20), nullable=False, default="medium")  # high, medium, low
    selected_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    session = relationship("IdeaBurstSession", back_populates="selected_ideas")
    
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




