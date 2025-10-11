"""
Ahrefs Export File model for Ahrefs TSV file processing
"""

from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Dict, Any, Optional
import uuid

Base = declarative_base()


class AhrefsExportFile(Base):
    """Model for Ahrefs export files"""
    
    __tablename__ = "ahrefs_export_files"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_path = Column(String(500), nullable=False)
    
    # File processing status
    status = Column(String(20), nullable=False, default="pending")  # pending, processing, completed, failed
    processing_started_at = Column(DateTime, nullable=True)
    processing_completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # File validation
    is_valid_format = Column(Boolean, nullable=False, default=False)
    has_required_columns = Column(Boolean, nullable=False, default=False)
    validation_errors = Column(Text, nullable=True)
    
    # Processing results
    total_keywords = Column(Integer, nullable=False, default=0)
    processed_keywords = Column(Integer, nullable=False, default=0)
    analysis_id = Column(String, nullable=True)
    
    # Metadata
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    keywords = relationship("Keyword", back_populates="ahrefs_file", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<AhrefsExportFile(id='{self.id}', filename='{self.filename}', status='{self.status}')>"
    
    def to_dict(self) -> dict:
        """Convert Ahrefs export file to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "filename": self.filename,
            "file_size": self.file_size,
            "file_path": self.file_path,
            "status": self.status,
            "processing_started_at": self.processing_started_at.isoformat() if self.processing_started_at else None,
            "processing_completed_at": self.processing_completed_at.isoformat() if self.processing_completed_at else None,
            "error_message": self.error_message,
            "is_valid_format": self.is_valid_format,
            "has_required_columns": self.has_required_columns,
            "validation_errors": self.validation_errors,
            "total_keywords": self.total_keywords,
            "processed_keywords": self.processed_keywords,
            "analysis_id": self.analysis_id,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> "AhrefsExportFile":
        """Create Ahrefs export file from dictionary"""
        return cls(
            id=data.get("id", str(uuid.uuid4())),
            user_id=data["user_id"],
            filename=data["filename"],
            file_size=data["file_size"],
            file_path=data["file_path"],
            status=data.get("status", "pending"),
            error_message=data.get("error_message"),
            is_valid_format=data.get("is_valid_format", False),
            has_required_columns=data.get("has_required_columns", False),
            validation_errors=data.get("validation_errors"),
            total_keywords=data.get("total_keywords", 0),
            processed_keywords=data.get("processed_keywords", 0),
            analysis_id=data.get("analysis_id")
        )
    
    def is_processing(self) -> bool:
        """Check if file is currently being processed"""
        return self.status == "processing"
    
    def is_completed(self) -> bool:
        """Check if file processing is completed"""
        return self.status == "completed"
    
    def is_failed(self) -> bool:
        """Check if file processing failed"""
        return self.status == "failed"
    
    def is_pending(self) -> bool:
        """Check if file is pending processing"""
        return self.status == "pending"
    
    def get_processing_time(self) -> Optional[float]:
        """Get processing time in seconds"""
        if self.processing_started_at and self.processing_completed_at:
            return (self.processing_completed_at - self.processing_started_at).total_seconds()
        return None
    
    def get_progress_percentage(self) -> int:
        """Get processing progress percentage"""
        if self.total_keywords == 0:
            return 0
        return min(100, int((self.processed_keywords / self.total_keywords) * 100))
    
    def mark_processing_started(self):
        """Mark file as processing started"""
        self.status = "processing"
        self.processing_started_at = datetime.utcnow()
    
    def mark_processing_completed(self, analysis_id: str):
        """Mark file as processing completed"""
        self.status = "completed"
        self.processing_completed_at = datetime.utcnow()
        self.analysis_id = analysis_id
    
    def mark_processing_failed(self, error_message: str):
        """Mark file as processing failed"""
        self.status = "failed"
        self.error_message = error_message
        self.processing_completed_at = datetime.utcnow()
    
    def update_processing_progress(self, processed_count: int):
        """Update processing progress"""
        self.processed_keywords = processed_count
    
    def set_validation_results(self, is_valid: bool, has_columns: bool, errors: Optional[str] = None):
        """Set file validation results"""
        self.is_valid_format = is_valid
        self.has_required_columns = has_columns
        if errors:
            self.validation_errors = errors
    
    def is_valid_for_processing(self) -> bool:
        """Check if file is valid for processing"""
        return self.is_valid_format and self.has_required_columns and not self.is_failed()
    
    def get_file_info(self) -> Dict[str, Any]:
        """Get file information"""
        return {
            "id": self.id,
            "filename": self.filename,
            "file_size": self.file_size,
            "file_path": self.file_path,
            "status": self.status,
            "total_keywords": self.total_keywords,
            "processed_keywords": self.processed_keywords,
            "progress_percentage": self.get_progress_percentage(),
            "is_valid": self.is_valid_for_processing(),
            "processing_time": self.get_processing_time()
        }
    
    def get_validation_summary(self) -> Dict[str, Any]:
        """Get validation summary"""
        return {
            "is_valid_format": self.is_valid_format,
            "has_required_columns": self.has_required_columns,
            "validation_errors": self.validation_errors,
            "is_valid_for_processing": self.is_valid_for_processing()
        }
    
    def get_processing_summary(self) -> Dict[str, Any]:
        """Get processing summary"""
        return {
            "status": self.status,
            "total_keywords": self.total_keywords,
            "processed_keywords": self.processed_keywords,
            "progress_percentage": self.get_progress_percentage(),
            "processing_time": self.get_processing_time(),
            "analysis_id": self.analysis_id,
            "error_message": self.error_message
        }
    
    def reset_processing(self):
        """Reset file for reprocessing"""
        self.status = "pending"
        self.processing_started_at = None
        self.processing_completed_at = None
        self.error_message = None
        self.processed_keywords = 0
        self.analysis_id = None
    
    def cleanup_file(self):
        """Clean up file resources"""
        # This would typically delete the file from storage
        # For now, just mark as cleaned up
        self.status = "cleaned_up"
        self.updated_at = datetime.utcnow()
    
    def get_export_data(self) -> Dict[str, Any]:
        """Get data for export"""
        return {
            "id": self.id,
            "filename": self.filename,
            "file_size": self.file_size,
            "status": self.status,
            "total_keywords": self.total_keywords,
            "processed_keywords": self.processed_keywords,
            "analysis_id": self.analysis_id,
            "uploaded_at": self.uploaded_at.isoformat() if self.uploaded_at else None,
            "processing_time": self.get_processing_time(),
            "progress_percentage": self.get_progress_percentage()
        }




