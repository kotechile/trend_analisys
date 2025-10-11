"""
Analysis report model for keyword analysis results
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import uuid

Base = declarative_base()


class KeywordAnalysisReport(Base):
    """Model for keyword analysis reports"""
    
    __tablename__ = "keyword_analysis_reports"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False, index=True)
    file_id = Column(String, ForeignKey("uploaded_files.id"), nullable=False)
    analysis_id = Column(String, nullable=False, unique=True, index=True)
    
    # Summary data
    total_keywords = Column(Integer, nullable=False, default=0)
    high_opportunity_count = Column(Integer, nullable=False, default=0)
    medium_opportunity_count = Column(Integer, nullable=False, default=0)
    low_opportunity_count = Column(Integer, nullable=False, default=0)
    total_search_volume = Column(Integer, nullable=False, default=0)
    average_difficulty = Column(Float, nullable=False, default=0.0)
    average_cpc = Column(Float, nullable=False, default=0.0)
    
    # Scoring weights used
    search_volume_weight = Column(Float, nullable=False, default=0.4)
    difficulty_weight = Column(Float, nullable=False, default=0.3)
    cpc_weight = Column(Float, nullable=False, default=0.2)
    intent_weight = Column(Float, nullable=False, default=0.1)
    
    # Status and timing
    status = Column(String(20), nullable=False, default="pending")  # pending, processing, completed, failed
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    error_message = Column(Text, nullable=True)
    
    # Report data (JSON)
    top_opportunities = Column(JSON, nullable=True)
    content_recommendations = Column(JSON, nullable=True)
    insights = Column(JSON, nullable=True)
    next_steps = Column(JSON, nullable=True)
    seo_content_ideas = Column(JSON, nullable=True)
    
    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    expires_at = Column(DateTime, default=lambda: datetime.utcnow() + timedelta(days=90))
    
    # Relationships
    file = relationship("UploadedFile", back_populates="reports")
    
    def __repr__(self):
        return f"<KeywordAnalysisReport(id='{self.id}', analysis_id='{self.analysis_id}', status='{self.status}')>"
    
    def to_dict(self) -> dict:
        """Convert report to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "file_id": self.file_id,
            "analysis_id": self.analysis_id,
            "total_keywords": self.total_keywords,
            "high_opportunity_count": self.high_opportunity_count,
            "medium_opportunity_count": self.medium_opportunity_count,
            "low_opportunity_count": self.low_opportunity_count,
            "total_search_volume": self.total_search_volume,
            "average_difficulty": self.average_difficulty,
            "average_cpc": self.average_cpc,
            "search_volume_weight": self.search_volume_weight,
            "difficulty_weight": self.difficulty_weight,
            "cpc_weight": self.cpc_weight,
            "intent_weight": self.intent_weight,
            "status": self.status,
            "started_at": self.started_at.isoformat() if self.started_at else None,
            "completed_at": self.completed_at.isoformat() if self.completed_at else None,
            "error_message": self.error_message,
            "top_opportunities": self.top_opportunities,
            "content_recommendations": self.content_recommendations,
            "insights": self.insights,
            "next_steps": self.next_steps,
            "seo_content_ideas": self.seo_content_ideas,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> "KeywordAnalysisReport":
        """Create report from dictionary"""
        return cls(
            id=data.get("id", str(uuid.uuid4())),
            user_id=data["user_id"],
            file_id=data["file_id"],
            analysis_id=data["analysis_id"],
            total_keywords=data.get("total_keywords", 0),
            high_opportunity_count=data.get("high_opportunity_count", 0),
            medium_opportunity_count=data.get("medium_opportunity_count", 0),
            low_opportunity_count=data.get("low_opportunity_count", 0),
            total_search_volume=data.get("total_search_volume", 0),
            average_difficulty=data.get("average_difficulty", 0.0),
            average_cpc=data.get("average_cpc", 0.0),
            search_volume_weight=data.get("search_volume_weight", 0.4),
            difficulty_weight=data.get("difficulty_weight", 0.3),
            cpc_weight=data.get("cpc_weight", 0.2),
            intent_weight=data.get("intent_weight", 0.1),
            status=data.get("status", "pending"),
            error_message=data.get("error_message")
        )
    
    def is_expired(self) -> bool:
        """Check if report has expired"""
        return datetime.utcnow() > self.expires_at
    
    def get_summary(self) -> Dict[str, Any]:
        """Get summary of the report"""
        return {
            "total_keywords": self.total_keywords,
            "high_opportunity_count": self.high_opportunity_count,
            "medium_opportunity_count": self.medium_opportunity_count,
            "low_opportunity_count": self.low_opportunity_count,
            "total_search_volume": self.total_search_volume,
            "average_difficulty": self.average_difficulty,
            "average_cpc": self.average_cpc
        }
    
    def get_top_opportunities(self) -> Dict[str, List[Dict]]:
        """Get top opportunities from the report"""
        if not self.top_opportunities:
            return {
                "high_opportunity_keywords": [],
                "quick_wins": [],
                "high_volume_targets": []
            }
        return self.top_opportunities
    
    def get_content_recommendations(self) -> List[Dict[str, Any]]:
        """Get content recommendations from the report"""
        return self.content_recommendations or []
    
    def get_insights(self) -> List[str]:
        """Get insights from the report"""
        return self.insights or []
    
    def get_next_steps(self) -> List[str]:
        """Get next steps from the report"""
        return self.next_steps or []
    
    def get_seo_content_ideas(self) -> List[Dict[str, Any]]:
        """Get SEO content ideas from the report"""
        return self.seo_content_ideas or []
    
    def update_summary(self, summary_data: Dict[str, Any]):
        """Update summary data"""
        self.total_keywords = summary_data.get("total_keywords", 0)
        self.high_opportunity_count = summary_data.get("high_opportunity_count", 0)
        self.medium_opportunity_count = summary_data.get("medium_opportunity_count", 0)
        self.low_opportunity_count = summary_data.get("low_opportunity_count", 0)
        self.total_search_volume = summary_data.get("total_search_volume", 0)
        self.average_difficulty = summary_data.get("average_difficulty", 0.0)
        self.average_cpc = summary_data.get("average_cpc", 0.0)
    
    def update_opportunities(self, opportunities_data: Dict[str, List[Dict]]):
        """Update top opportunities data"""
        self.top_opportunities = opportunities_data
    
    def update_content_recommendations(self, recommendations: List[Dict[str, Any]]):
        """Update content recommendations"""
        self.content_recommendations = recommendations
    
    def update_insights(self, insights: List[str]):
        """Update insights"""
        self.insights = insights
    
    def update_next_steps(self, next_steps: List[str]):
        """Update next steps"""
        self.next_steps = next_steps
    
    def update_seo_content_ideas(self, content_ideas: List[Dict[str, Any]]):
        """Update SEO content ideas"""
        self.seo_content_ideas = content_ideas
    
    def mark_completed(self):
        """Mark report as completed"""
        self.status = "completed"
        self.completed_at = datetime.utcnow()
    
    def mark_failed(self, error_message: str):
        """Mark report as failed"""
        self.status = "failed"
        self.error_message = error_message
    
    def get_processing_time(self) -> Optional[float]:
        """Get processing time in seconds"""
        if self.started_at and self.completed_at:
            return (self.completed_at - self.started_at).total_seconds()
        return None
    
    def get_progress_percentage(self, keywords_processed: int) -> int:
        """Get progress percentage based on keywords processed"""
        if self.total_keywords == 0:
            return 0
        return min(100, int((keywords_processed / self.total_keywords) * 100))
    
    def validate_scoring_weights(self) -> bool:
        """Validate that scoring weights sum to 1.0"""
        total_weight = (
            self.search_volume_weight + 
            self.difficulty_weight + 
            self.cpc_weight + 
            self.intent_weight
        )
        return abs(total_weight - 1.0) < 0.001
    
    def get_scoring_weights(self) -> Dict[str, float]:
        """Get scoring weights as dictionary"""
        return {
            "search_volume": self.search_volume_weight,
            "keyword_difficulty": self.difficulty_weight,
            "cpc": self.cpc_weight,
            "search_intent": self.intent_weight
        }
    
    def set_scoring_weights(self, weights: Dict[str, float]):
        """Set scoring weights from dictionary"""
        self.search_volume_weight = weights.get("search_volume", 0.4)
        self.difficulty_weight = weights.get("keyword_difficulty", 0.3)
        self.cpc_weight = weights.get("cpc", 0.2)
        self.intent_weight = weights.get("search_intent", 0.1)
