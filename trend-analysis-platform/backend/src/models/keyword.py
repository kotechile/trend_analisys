"""
Keyword model for keyword analysis data
"""

from datetime import datetime
from typing import List, Optional
import uuid

Base = declarative_base()

class Keyword:
    """Simple data class for Keyword - use Supabase for database operations"""
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

class UploadedFile(Base):
    """Model for uploaded files"""
    
    # __tablename__ = "uploaded_files"
    
    # id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    # user_id = Column(String, nullable=False, index=True)
    # filename = Column(String(255), nullable=False)
    # file_size = Column(Integer, nullable=False)
    # file_path = Column(String(500), nullable=False)
    # status = Column(String(20), nullable=False, default="pending")  # pending, processing, completed, failed
    # uploaded_at = Column(DateTime, default=datetime.utcnow)
    # processing_started_at = Column(DateTime, nullable=True)
    # processing_completed_at = Column(DateTime, nullable=True)
    # error_message = Column(Text, nullable=True)
    
    # Relationships
    # keywords = relationship("Keyword", back_populates="file", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<UploadedFile(id='{self.id}', filename='{self.filename}', status='{self.status}')>"
    
    def to_dict(self) -> dict:
        """Convert uploaded file to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "filename": self.filename,
            "file_size": self.file_size,
            "file_path": self.file_path,
            "status": self.status,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "processing_started_at": self.processing_started_at.isoformat() if self.processing_started_at else None,
            "processing_completed_at": self.processing_completed_at.isoformat() if self.processing_completed_at else None,
            "error_message": self.error_message
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> "UploadedFile":
        """Create uploaded file from dictionary"""
        return cls(
            id=data.get("id", str(uuid.uuid4())),
            user_id=data["user_id"],
            filename=data["filename"],
            file_size=data["file_size"],
            file_path=data["file_path"],
            status=data.get("status", "pending"),
            error_message=data.get("error_message")
        )
