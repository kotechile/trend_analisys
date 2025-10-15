"""
Export Templates model for TrendTap
"""

from enum import Enum as PyEnum
from ..core.database import Base

class ExportFormat(PyEnum):
    """Export format enumeration"""
    PDF = "pdf"
    DOCX = "docx"
    HTML = "html"
    MARKDOWN = "markdown"
    JSON = "json"
    CSV = "csv"

class ExportStatus(PyEnum):
    """Export status enumeration"""
    DRAFT = "draft"
    ACTIVE = "active"
    INACTIVE = "inactive"
    ARCHIVED = "archived"

class ExportTemplate(Base):
    """Export template model"""
    __tablename__ = "export_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    format = Column(Enum(ExportFormat), nullable=False)
    template_content = Column(Text, nullable=False)
    template_config = Column(JSON, nullable=True)
    status = Column(Enum(ExportStatus), default=ExportStatus.ACTIVE, nullable=False)
    is_default = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<ExportTemplate(id={self.id}, name='{self.name}', format='{self.format.value}')>"
    
    def to_dict(self):
        """Convert export template to dictionary"""
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "format": self.format.value,
            "template_content": self.template_content,
            "template_config": self.template_config,
            "status": self.status.value,
            "is_default": self.is_default,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
    
    def is_active(self) -> bool:
        """Check if template is active"""
        return self.status == ExportStatus.ACTIVE
    
    def is_default_template(self) -> bool:
        """Check if template is default"""
        return self.is_default
