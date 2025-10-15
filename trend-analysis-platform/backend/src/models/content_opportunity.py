"""
Content opportunity model for SEO content ideas
"""

from datetime import datetime
from typing import Dict, List, Optional, Any
import uuid

Base = declarative_base()

class ContentOpportunity(Base):
    """Model for content opportunities and SEO content ideas"""
    
    __tablename__ = "content_opportunities"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    report_id = Column(String, ForeignKey("keyword_analysis_reports.id"), nullable=False)
    user_id = Column(String, nullable=False, index=True)
    
    # Content idea details
    title = Column(String(500), nullable=False)
    content_type = Column(String(50), nullable=False)  # list-article, how-to-guide, comparison, etc.
    description = Column(Text, nullable=True)
    
    # Keywords
    primary_keywords = Column(JSON, nullable=False)  # List of primary keywords
    secondary_keywords = Column(JSON, nullable=False)  # List of secondary keywords
    
    # SEO metrics
    seo_optimization_score = Column(Float, nullable=False, default=0.0)
    traffic_potential_score = Column(Float, nullable=False, default=0.0)
    total_search_volume = Column(Integer, nullable=False, default=0)
    average_difficulty = Column(Float, nullable=False, default=0.0)
    average_cpc = Column(Float, nullable=False, default=0.0)
    
    # Content structure
    content_outline = Column(Text, nullable=True)
    optimization_tips = Column(JSON, nullable=True)  # List of optimization tips
    target_audience = Column(String(100), nullable=True)
    content_length = Column(String(50), nullable=True)  # short, medium, long
    
    # Status and metadata
    status = Column(String(20), nullable=False, default="draft")  # draft, selected, implemented, published
    priority = Column(String(20), nullable=False, default="medium")  # high, medium, low
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    report = relationship("KeywordAnalysisReport", back_populates="content_opportunities")
    
    def __repr__(self):
        return f"<ContentOpportunity(id='{self.id}', title='{self.title[:50]}...')>"
    
    def to_dict(self) -> dict:
        """Convert content opportunity to dictionary"""
        return {
            "id": self.id,
            "report_id": self.report_id,
            "user_id": self.user_id,
            "title": self.title,
            "content_type": self.content_type,
            "description": self.description,
            "primary_keywords": self.primary_keywords,
            "secondary_keywords": self.secondary_keywords,
            "seo_optimization_score": self.seo_optimization_score,
            "traffic_potential_score": self.traffic_potential_score,
            "total_search_volume": self.total_search_volume,
            "average_difficulty": self.average_difficulty,
            "average_cpc": self.average_cpc,
            "content_outline": self.content_outline,
            "optimization_tips": self.optimization_tips,
            "target_audience": self.target_audience,
            "content_length": self.content_length,
            "status": self.status,
            "priority": self.priority,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }
    
    @classmethod
    def from_dict(cls, data: dict) -> "ContentOpportunity":
        """Create content opportunity from dictionary"""
        return cls(
            id=data.get("id", str(uuid.uuid4())),
            report_id=data["report_id"],
            user_id=data["user_id"],
            title=data["title"],
            content_type=data["content_type"],
            description=data.get("description"),
            primary_keywords=data.get("primary_keywords", []),
            secondary_keywords=data.get("secondary_keywords", []),
            seo_optimization_score=data.get("seo_optimization_score", 0.0),
            traffic_potential_score=data.get("traffic_potential_score", 0.0),
            total_search_volume=data.get("total_search_volume", 0),
            average_difficulty=data.get("average_difficulty", 0.0),
            average_cpc=data.get("average_cpc", 0.0),
            content_outline=data.get("content_outline"),
            optimization_tips=data.get("optimization_tips", []),
            target_audience=data.get("target_audience"),
            content_length=data.get("content_length"),
            status=data.get("status", "draft"),
            priority=data.get("priority", "medium")
        )
    
    def get_combined_score(self) -> float:
        """Get combined SEO and traffic potential score"""
        return (self.seo_optimization_score + self.traffic_potential_score) / 2
    
    def get_difficulty_level(self) -> str:
        """Get difficulty level based on average difficulty"""
        if self.average_difficulty <= 30:
            return "easy"
        elif self.average_difficulty <= 60:
            return "medium"
        else:
            return "hard"
    
    def get_priority_score(self) -> float:
        """Get priority score based on multiple factors"""
        # Weighted combination of SEO score, traffic potential, and difficulty
        seo_weight = 0.4
        traffic_weight = 0.4
        difficulty_weight = 0.2
        
        # Invert difficulty (lower difficulty = higher score)
        difficulty_score = max(0, 100 - self.average_difficulty)
        
        priority_score = (
            self.seo_optimization_score * seo_weight +
            self.traffic_potential_score * traffic_weight +
            difficulty_score * difficulty_weight
        )
        
        return round(priority_score, 2)
    
    def is_high_priority(self) -> bool:
        """Check if content opportunity is high priority"""
        return self.get_priority_score() >= 80
    
    def is_quick_win(self) -> bool:
        """Check if content opportunity is a quick win"""
        return (
            self.average_difficulty <= 35 and 
            self.traffic_potential_score >= 70
        )
    
    def get_keyword_density(self) -> Dict[str, int]:
        """Get keyword density for primary and secondary keywords"""
        total_keywords = len(self.primary_keywords) + len(self.secondary_keywords)
        return {
            "primary": len(self.primary_keywords),
            "secondary": len(self.secondary_keywords),
            "total": total_keywords
        }
    
    def get_content_type_category(self) -> str:
        """Get content type category"""
        content_categories = {
            "list-article": "informational",
            "how-to-guide": "informational",
            "comparison": "commercial",
            "review": "commercial",
            "tutorial": "informational",
            "case-study": "informational",
            "news": "informational"
        }
        return content_categories.get(self.content_type, "informational")
    
    def get_estimated_reading_time(self) -> int:
        """Get estimated reading time in minutes"""
        content_length_mapping = {
            "short": 3,
            "medium": 7,
            "long": 12
        }
        return content_length_mapping.get(self.content_length, 5)
    
    def get_optimization_tips_count(self) -> int:
        """Get number of optimization tips"""
        return len(self.optimization_tips) if self.optimization_tips else 0
    
    def add_optimization_tip(self, tip: str):
        """Add optimization tip"""
        if not self.optimization_tips:
            self.optimization_tips = []
        self.optimization_tips.append(tip)
    
    def remove_optimization_tip(self, tip: str):
        """Remove optimization tip"""
        if self.optimization_tips and tip in self.optimization_tips:
            self.optimization_tips.remove(tip)
    
    def update_status(self, status: str):
        """Update content opportunity status"""
        valid_statuses = ["draft", "selected", "implemented", "published"]
        if status in valid_statuses:
            self.status = status
            self.updated_at = datetime.utcnow()
    
    def update_priority(self, priority: str):
        """Update content opportunity priority"""
        valid_priorities = ["high", "medium", "low"]
        if priority in valid_priorities:
            self.priority = priority
            self.updated_at = datetime.utcnow()
    
    def get_keyword_analysis(self) -> Dict[str, Any]:
        """Get keyword analysis summary"""
        return {
            "primary_keywords": self.primary_keywords,
            "secondary_keywords": self.secondary_keywords,
            "total_keywords": len(self.primary_keywords) + len(self.secondary_keywords),
            "total_search_volume": self.total_search_volume,
            "average_difficulty": self.average_difficulty,
            "average_cpc": self.average_cpc,
            "difficulty_level": self.get_difficulty_level()
        }
    
    def get_seo_analysis(self) -> Dict[str, Any]:
        """Get SEO analysis summary"""
        return {
            "seo_optimization_score": self.seo_optimization_score,
            "traffic_potential_score": self.traffic_potential_score,
            "combined_score": self.get_combined_score(),
            "priority_score": self.get_priority_score(),
            "is_high_priority": self.is_high_priority(),
            "is_quick_win": self.is_quick_win()
        }
    
    def get_content_analysis(self) -> Dict[str, Any]:
        """Get content analysis summary"""
        return {
            "title": self.title,
            "content_type": self.content_type,
            "content_category": self.get_content_type_category(),
            "content_length": self.content_length,
            "estimated_reading_time": self.get_estimated_reading_time(),
            "target_audience": self.target_audience,
            "optimization_tips_count": self.get_optimization_tips_count()
        }
    
    def validate_keywords(self) -> bool:
        """Validate that keywords are properly set"""
        return (
            isinstance(self.primary_keywords, list) and 
            isinstance(self.secondary_keywords, list) and
            len(self.primary_keywords) > 0
        )
    
    def get_export_data(self) -> Dict[str, Any]:
        """Get data for export"""
        return {
            "id": self.id,
            "title": self.title,
            "content_type": self.content_type,
            "primary_keywords": self.primary_keywords,
            "secondary_keywords": self.secondary_keywords,
            "seo_optimization_score": self.seo_optimization_score,
            "traffic_potential_score": self.traffic_potential_score,
            "total_search_volume": self.total_search_volume,
            "average_difficulty": self.average_difficulty,
            "average_cpc": self.average_cpc,
            "content_outline": self.content_outline,
            "optimization_tips": self.optimization_tips,
            "priority": self.priority,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
