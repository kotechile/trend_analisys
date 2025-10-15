"""
Selection Indicator model for idea selection criteria
"""

from datetime import datetime
from typing import Dict, List, Optional, Any
import uuid

Base = declarative_base()

class SelectionIndicator:
    """Simple data class for SelectionIndicator - use Supabase for database operations"""
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

class IndicatorTemplate(Base):
    """Model for indicator templates"""
    
    # __tablename__ = "indicator_templates"
    
    # id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    # template_name = Column(String(100), nullable=False)
    # template_description = Column(Text, nullable=True)
    # idea_type = Column(String(20), nullable=False)  # blog, software, all
    
    # Template configuration
    # indicators_config = Column(JSON, nullable=False)  # List of indicator configurations
    # default_weights = Column(JSON, nullable=True)  # Default weights for indicators
    # color_scheme = Column(JSON, nullable=True)  # Color scheme configuration
    
    # Metadata
    # is_default = Column(Boolean, nullable=False, default=False)
    # created_by = Column(String, nullable=True)  # User ID who created the template
    # created_at = Column(DateTime, default=datetime.utcnow)
    # updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<IndicatorTemplate(id='{self.id}', name='{self.template_name}')>"
    
    def to_dict(self) -> dict:
        """Convert indicator template to dictionary"""
        return {
            "id": self.id,
            "template_name": self.template_name,
            "template_description": self.template_description,
            "idea_type": self.idea_type,
            "indicators_config": self.indicators_config,
            "default_weights": self.default_weights,
            "color_scheme": self.color_scheme,
            "is_default": self.is_default,
            "created_by": self.created_by,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> "IndicatorTemplate":
        """Create indicator template from dictionary"""
        return cls(
            id=data.get("id", str(uuid.uuid4())),
            template_name=data["template_name"],
            template_description=data.get("template_description"),
            idea_type=data["idea_type"],
            indicators_config=data["indicators_config"],
            default_weights=data.get("default_weights"),
            color_scheme=data.get("color_scheme"),
            is_default=data.get("is_default", False),
            created_by=data.get("created_by")
        )
    
    def get_indicators_for_idea_type(self, idea_type: str) -> List[Dict[str, Any]]:
        """Get indicators configuration for specific idea type"""
        if self.idea_type == "all" or self.idea_type == idea_type:
            return self.indicators_config
        return []
    
    def apply_to_session(self, session_id: str, idea_type: str) -> List[SelectionIndicator]:
        """Apply template to a session"""
        indicators = []
        configs = self.get_indicators_for_idea_type(idea_type)
        
        for config in configs:
            indicator = SelectionIndicator(
                session_id=session_id,
                idea_id="",  # Will be set when applied to specific ideas
                idea_type=idea_type,
                indicator_type=config["type"],
                indicator_value=0.0,  # Will be calculated
                indicator_label=config["label"],
                indicator_color=config.get("color", "info"),
                indicator_description=config.get("description"),
                weight=config.get("weight", 1.0),
                is_primary=config.get("is_primary", False),
                priority_order=config.get("priority_order", 0)
            )
            indicators.append(indicator)
        
        return indicators

