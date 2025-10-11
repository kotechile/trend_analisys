"""
Selection Indicator model for idea selection criteria
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import Dict, List, Optional, Any
import uuid

Base = declarative_base()


class SelectionIndicator(Base):
    """Model for selection indicators in Idea Burst"""
    
    __tablename__ = "selection_indicators"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id = Column(String, ForeignKey("idea_burst_sessions.id"), nullable=True)
    idea_id = Column(String, nullable=False)
    idea_type = Column(String(20), nullable=False)  # blog, software
    
    # Indicator details
    indicator_type = Column(String(50), nullable=False)  # seo_score, traffic_potential, difficulty, etc.
    indicator_value = Column(Float, nullable=False)
    indicator_label = Column(String(100), nullable=False)
    indicator_color = Column(String(20), nullable=False)  # success, warning, error, info, etc.
    indicator_description = Column(Text, nullable=True)
    
    # Weighting and priority
    weight = Column(Float, nullable=False, default=1.0)
    is_primary = Column(Boolean, nullable=False, default=False)
    priority_order = Column(Integer, nullable=False, default=0)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f"<SelectionIndicator(id='{self.id}', type='{self.indicator_type}', value={self.indicator_value})>"
    
    def to_dict(self) -> dict:
        """Convert selection indicator to dictionary"""
        return {
            "id": self.id,
            "session_id": self.session_id,
            "idea_id": self.idea_id,
            "idea_type": self.idea_type,
            "indicator_type": self.indicator_type,
            "indicator_value": self.indicator_value,
            "indicator_label": self.indicator_label,
            "indicator_color": self.indicator_color,
            "indicator_description": self.indicator_description,
            "weight": self.weight,
            "is_primary": self.is_primary,
            "priority_order": self.priority_order,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> "SelectionIndicator":
        """Create selection indicator from dictionary"""
        return cls(
            id=data.get("id", str(uuid.uuid4())),
            session_id=data.get("session_id"),
            idea_id=data["idea_id"],
            idea_type=data["idea_type"],
            indicator_type=data["indicator_type"],
            indicator_value=data["indicator_value"],
            indicator_label=data["indicator_label"],
            indicator_color=data["indicator_color"],
            indicator_description=data.get("indicator_description"),
            weight=data.get("weight", 1.0),
            is_primary=data.get("is_primary", False),
            priority_order=data.get("priority_order", 0)
        )
    
    def get_color_class(self) -> str:
        """Get CSS color class for the indicator"""
        color_mapping = {
            "success": "text-success",
            "warning": "text-warning", 
            "error": "text-danger",
            "info": "text-info",
            "primary": "text-primary",
            "secondary": "text-secondary"
        }
        return color_mapping.get(self.indicator_color, "text-muted")
    
    def get_progress_percentage(self) -> float:
        """Get progress percentage for the indicator value"""
        # Normalize value to 0-100 based on indicator type
        if self.indicator_type in ["seo_score", "traffic_potential"]:
            return min(100, max(0, self.indicator_value))
        elif self.indicator_type == "difficulty":
            return min(100, max(0, 100 - self.indicator_value))  # Invert difficulty
        elif self.indicator_type == "search_volume":
            return min(100, max(0, self.indicator_value / 100))  # Normalize volume
        elif self.indicator_type == "cpc":
            return min(100, max(0, self.indicator_value * 20))  # Normalize CPC
        else:
            return min(100, max(0, self.indicator_value))
    
    def get_quality_level(self) -> str:
        """Get quality level based on indicator value"""
        percentage = self.get_progress_percentage()
        
        if percentage >= 80:
            return "excellent"
        elif percentage >= 60:
            return "good"
        elif percentage >= 40:
            return "fair"
        else:
            return "poor"
    
    def get_recommendation(self) -> str:
        """Get recommendation based on indicator value"""
        if self.indicator_type == "seo_score":
            if self.indicator_value >= 80:
                return "Excellent SEO potential - prioritize this idea"
            elif self.indicator_value >= 60:
                return "Good SEO potential - consider for implementation"
            elif self.indicator_value >= 40:
                return "Fair SEO potential - may need optimization"
            else:
                return "Low SEO potential - consider other ideas"
        
        elif self.indicator_type == "traffic_potential":
            if self.indicator_value >= 80:
                return "High traffic potential - great for growth"
            elif self.indicator_value >= 60:
                return "Good traffic potential - solid choice"
            elif self.indicator_value >= 40:
                return "Moderate traffic potential - niche audience"
            else:
                return "Low traffic potential - limited reach"
        
        elif self.indicator_type == "difficulty":
            if self.indicator_value <= 30:
                return "Easy to rank - quick win opportunity"
            elif self.indicator_value <= 60:
                return "Moderate difficulty - achievable with effort"
            else:
                return "High difficulty - requires significant resources"
        
        elif self.indicator_type == "search_volume":
            if self.indicator_value >= 10000:
                return "High search volume - broad appeal"
            elif self.indicator_value >= 1000:
                return "Good search volume - decent audience"
            elif self.indicator_value >= 100:
                return "Moderate search volume - niche topic"
            else:
                return "Low search volume - very specific audience"
        
        elif self.indicator_type == "cpc":
            if self.indicator_value >= 3.0:
                return "High commercial value - monetization potential"
            elif self.indicator_value >= 1.0:
                return "Moderate commercial value - some monetization"
            else:
                return "Low commercial value - informational focus"
        
        return "Consider this indicator in your decision"
    
    def get_visual_representation(self) -> Dict[str, Any]:
        """Get visual representation data for the indicator"""
        return {
            "value": self.indicator_value,
            "percentage": self.get_progress_percentage(),
            "color": self.indicator_color,
            "color_class": self.get_color_class(),
            "quality_level": self.get_quality_level(),
            "recommendation": self.get_recommendation(),
            "is_primary": self.is_primary,
            "weight": self.weight
        }
    
    def update_weight(self, new_weight: float):
        """Update indicator weight"""
        self.weight = max(0.0, min(1.0, new_weight))
        self.updated_at = datetime.utcnow()
    
    def set_primary(self, is_primary: bool):
        """Set or unset primary indicator"""
        self.is_primary = is_primary
        self.updated_at = datetime.utcnow()
    
    def update_priority_order(self, order: int):
        """Update priority order"""
        self.priority_order = order
        self.updated_at = datetime.utcnow()
    
    def get_export_data(self) -> Dict[str, Any]:
        """Get data for export"""
        return {
            "id": self.id,
            "idea_id": self.idea_id,
            "idea_type": self.idea_type,
            "indicator_type": self.indicator_type,
            "indicator_value": self.indicator_value,
            "indicator_label": self.indicator_label,
            "indicator_color": self.indicator_color,
            "indicator_description": self.indicator_description,
            "weight": self.weight,
            "is_primary": self.is_primary,
            "priority_order": self.priority_order,
            "quality_level": self.get_quality_level(),
            "recommendation": self.get_recommendation(),
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class IndicatorTemplate(Base):
    """Model for indicator templates"""
    
    __tablename__ = "indicator_templates"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    template_name = Column(String(100), nullable=False)
    template_description = Column(Text, nullable=True)
    idea_type = Column(String(20), nullable=False)  # blog, software, all
    
    # Template configuration
    indicators_config = Column(JSON, nullable=False)  # List of indicator configurations
    default_weights = Column(JSON, nullable=True)  # Default weights for indicators
    color_scheme = Column(JSON, nullable=True)  # Color scheme configuration
    
    # Metadata
    is_default = Column(Boolean, nullable=False, default=False)
    created_by = Column(String, nullable=True)  # User ID who created the template
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
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




