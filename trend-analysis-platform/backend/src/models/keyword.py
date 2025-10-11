"""
Keyword model for keyword analysis data
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime
from typing import List, Optional
import uuid

Base = declarative_base()


class Keyword(Base):
    """Keyword model for storing keyword analysis data"""
    
    __tablename__ = "keywords"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    file_id = Column(String, ForeignKey("uploaded_files.id"), nullable=False)
    keyword = Column(String(500), nullable=False, index=True)
    search_volume = Column(Integer, nullable=False, default=0)
    keyword_difficulty = Column(Float, nullable=False, default=0.0)
    cpc = Column(Float, nullable=False, default=0.0)
    intents = Column(Text, nullable=True)  # Comma-separated intent tags
    opportunity_score = Column(Float, nullable=False, default=0.0)
    category = Column(String(20), nullable=False, default="low")  # high, medium, low
    primary_intent = Column(String(50), nullable=True)  # Informational, Commercial, etc.
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    file = relationship("UploadedFile", back_populates="keywords")
    
    def __repr__(self):
        return f"<Keyword(id='{self.id}', keyword='{self.keyword}', volume={self.search_volume})>"
    
    def to_dict(self) -> dict:
        """Convert keyword to dictionary"""
        return {
            "id": self.id,
            "file_id": self.file_id,
            "keyword": self.keyword,
            "search_volume": self.search_volume,
            "keyword_difficulty": self.keyword_difficulty,
            "cpc": self.cpc,
            "intents": self.intents,
            "opportunity_score": self.opportunity_score,
            "category": self.category,
            "primary_intent": self.primary_intent,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> "Keyword":
        """Create keyword from dictionary"""
        return cls(
            id=data.get("id", str(uuid.uuid4())),
            file_id=data["file_id"],
            keyword=data["keyword"],
            search_volume=data.get("search_volume", 0),
            keyword_difficulty=data.get("keyword_difficulty", 0.0),
            cpc=data.get("cpc", 0.0),
            intents=data.get("intents"),
            opportunity_score=data.get("opportunity_score", 0.0),
            category=data.get("category", "low"),
            primary_intent=data.get("primary_intent")
        )
    
    def calculate_opportunity_score(
        self, 
        search_volume_weight: float = 0.4,
        difficulty_weight: float = 0.3,
        cpc_weight: float = 0.2,
        intent_weight: float = 0.1
    ) -> float:
        """Calculate opportunity score based on weighted factors"""
        
        # Normalize search volume (0-100 scale)
        volume_score = min(self.search_volume / 1000, 100) if self.search_volume > 0 else 0
        
        # Normalize difficulty (invert so lower difficulty = higher score)
        difficulty_score = max(0, 100 - self.keyword_difficulty)
        
        # Normalize CPC (0-100 scale)
        cpc_score = min(self.cpc * 20, 100) if self.cpc > 0 else 0
        
        # Intent score based on primary intent
        intent_score = self._get_intent_score()
        
        # Calculate weighted score
        opportunity_score = (
            volume_score * search_volume_weight +
            difficulty_score * difficulty_weight +
            cpc_score * cpc_weight +
            intent_score * intent_weight
        )
        
        return round(opportunity_score, 2)
    
    def _get_intent_score(self) -> float:
        """Get intent score based on primary intent"""
        if not self.primary_intent:
            return 50  # Default score for unknown intent
        
        intent_scores = {
            "Informational": 90,  # Highest priority for blog content
            "Commercial": 80,     # High priority for monetization
            "Navigational": 60,  # Medium priority
            "Transactional": 70  # Medium-high priority
        }
        
        return intent_scores.get(self.primary_intent, 50)
    
    def categorize_opportunity(self) -> str:
        """Categorize keyword based on opportunity score"""
        if self.opportunity_score >= 80:
            return "high"
        elif self.opportunity_score >= 60:
            return "medium"
        else:
            return "low"
    
    def is_quick_win(self) -> bool:
        """Check if keyword is a quick win (low difficulty, decent volume)"""
        return (
            self.keyword_difficulty <= 25 and 
            self.search_volume >= 200
        )
    
    def is_high_volume_target(self) -> bool:
        """Check if keyword is a high volume target"""
        return self.search_volume >= 5000
    
    def get_intent_list(self) -> List[str]:
        """Get list of intents from comma-separated string"""
        if not self.intents:
            return []
        return [intent.strip() for intent in self.intents.split(",") if intent.strip()]
    
    def set_primary_intent(self):
        """Set primary intent based on intents list"""
        intent_list = self.get_intent_list()
        if not intent_list:
            self.primary_intent = None
            return
        
        # Priority order for primary intent
        intent_priority = ["Informational", "Commercial", "Transactional", "Navigational"]
        
        for intent in intent_priority:
            if intent in intent_list:
                self.primary_intent = intent
                return
        
        # If no priority intent found, use first one
        self.primary_intent = intent_list[0]


class UploadedFile(Base):
    """Model for uploaded files"""
    
    __tablename__ = "uploaded_files"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    filename = Column(String(255), nullable=False)
    file_size = Column(Integer, nullable=False)
    file_path = Column(String(500), nullable=False)
    status = Column(String(20), nullable=False, default="pending")  # pending, processing, completed, failed
    uploaded_at = Column(DateTime, default=datetime.utcnow)
    processing_started_at = Column(DateTime, nullable=True)
    processing_completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Relationships
    keywords = relationship("Keyword", back_populates="file", cascade="all, delete-orphan")
    
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
