"""
TrendAnalysis model for TrendTap
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, JSON, Enum, Float
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from enum import Enum as PyEnum
from ..core.database import Base


class AnalysisStatus(PyEnum):
    """Analysis status enumeration"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class TrendAnalysis(Base):
    """Trend analysis model"""
    __tablename__ = "trend_analyses"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    affiliate_research_id = Column(Integer, ForeignKey("affiliate_researches.id"), nullable=True, index=True)
    topics = Column(JSON, nullable=False)  # Array of topics to analyze
    status = Column(Enum(AnalysisStatus), default=AnalysisStatus.PENDING, nullable=False)
    
    # Analysis results
    opportunity_scores = Column(JSON, nullable=True)  # Topic -> score mapping
    llm_forecast = Column(JSON, nullable=True)  # LLM forecast data
    social_signals = Column(JSON, nullable=True)  # Social media signals
    google_trends_data = Column(JSON, nullable=True)  # Google Trends data
    news_signals = Column(JSON, nullable=True)  # News cycle signals
    
    # Analysis metadata
    analysis_duration = Column(Integer, nullable=True)  # Duration in seconds
    error_message = Column(Text, nullable=True)
    warnings = Column(JSON, nullable=True)  # Array of warning messages
    
    # Model information
    model_version = Column(String(50), nullable=True)
    confidence_score = Column(Float, nullable=True)  # Overall confidence score
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    completed_at = Column(DateTime(timezone=True), nullable=True)
    
    # Relationships
    user = relationship("User", back_populates="trend_analyses")
    affiliate_research = relationship("AffiliateResearch", back_populates="trend_analyses")
    keyword_data = relationship("KeywordData", back_populates="trend_analysis")
    
    def __repr__(self):
        return f"<TrendAnalysis(id={self.id}, topics={self.topics}, status='{self.status.value}')>"
    
    def to_dict(self):
        """Convert trend analysis to dictionary"""
        return {
            "id": self.id,
            "user_id": self.user_id,
            "affiliate_research_id": self.affiliate_research_id,
            "topics": self.topics,
            "status": self.status.value,
            "opportunity_scores": self.opportunity_scores,
            "llm_forecast": self.llm_forecast,
            "social_signals": self.social_signals,
            "google_trends_data": self.google_trends_data,
            "news_signals": self.news_signals,
            "analysis_duration": self.analysis_duration,
            "error_message": self.error_message,
            "warnings": self.warnings,
            "model_version": self.model_version,
            "confidence_score": self.confidence_score,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "completed_at": self.completed_at.isoformat() if self.completed_at else None
        }
    
    def is_completed(self) -> bool:
        """Check if analysis is completed"""
        return self.status == AnalysisStatus.COMPLETED
    
    def is_failed(self) -> bool:
        """Check if analysis failed"""
        return self.status == AnalysisStatus.FAILED
    
    def is_processing(self) -> bool:
        """Check if analysis is processing"""
        return self.status == AnalysisStatus.PROCESSING
    
    def get_top_opportunities(self, limit: int = 5) -> list:
        """Get top opportunities by score"""
        if not self.opportunity_scores:
            return []
        
        # Sort by opportunity score (highest first)
        sorted_opportunities = sorted(
            self.opportunity_scores.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return sorted_opportunities[:limit]
    
    def get_opportunity_score(self, topic: str) -> float:
        """Get opportunity score for specific topic"""
        if not self.opportunity_scores:
            return 0.0
        
        return self.opportunity_scores.get(topic, 0.0)
    
    def get_high_opportunity_topics(self, threshold: float = 70.0) -> list:
        """Get topics with opportunity score above threshold"""
        if not self.opportunity_scores:
            return []
        
        return [
            topic for topic, score in self.opportunity_scores.items()
            if score >= threshold
        ]
    
    def get_forecast_for_topic(self, topic: str) -> dict:
        """Get forecast data for specific topic"""
        if not self.llm_forecast or "forecast" not in self.llm_forecast:
            return {}
        
        for forecast in self.llm_forecast["forecast"]:
            if forecast.get("topic") == topic:
                return forecast
        
        return {}
    
    def get_social_signal_strength(self, platform: str) -> float:
        """Get social signal strength for platform"""
        if not self.social_signals or platform not in self.social_signals:
            return 0.0
        
        platform_data = self.social_signals[platform]
        if not platform_data:
            return 0.0
        
        # Calculate average engagement/sentiment
        total_engagement = 0
        count = 0
        
        for signal in platform_data:
            if "engagement_rate" in signal:
                total_engagement += signal["engagement_rate"]
                count += 1
            elif "sentiment" in signal:
                total_engagement += signal["sentiment"]
                count += 1
        
        return total_engagement / count if count > 0 else 0.0
    
    def get_google_trends_trend(self) -> str:
        """Get Google Trends trend direction"""
        if not self.google_trends_data:
            return "unknown"
        
        seasonality = self.google_trends_data.get("seasonality", "unknown")
        return seasonality
    
    def get_peak_months(self) -> list:
        """Get peak months from Google Trends data"""
        if not self.google_trends_data:
            return []
        
        return self.google_trends_data.get("peak_months", [])
    
    def add_warning(self, warning: str):
        """Add warning message"""
        if not self.warnings:
            self.warnings = []
        
        if warning not in self.warnings:
            self.warnings.append(warning)
    
    def mark_completed(self, results: dict = None):
        """Mark analysis as completed"""
        self.status = AnalysisStatus.COMPLETED
        self.completed_at = func.now()
        
        if results:
            self.opportunity_scores = results.get("opportunity_scores")
            self.llm_forecast = results.get("llm_forecast")
            self.social_signals = results.get("social_signals")
            self.google_trends_data = results.get("google_trends_data")
            self.news_signals = results.get("news_signals")
            self.model_version = results.get("model_version")
            self.confidence_score = results.get("confidence_score")
    
    def mark_failed(self, error_message: str):
        """Mark analysis as failed"""
        self.status = AnalysisStatus.FAILED
        self.error_message = error_message
        self.completed_at = func.now()
    
    def calculate_overall_confidence(self) -> float:
        """Calculate overall confidence score"""
        if not self.llm_forecast or "forecast" not in self.llm_forecast:
            return 0.0
        
        # Calculate average confidence from forecast intervals
        total_confidence = 0
        count = 0
        
        for forecast in self.llm_forecast["forecast"]:
            if "confidence_interval" in forecast:
                ci = forecast["confidence_interval"]
                if len(ci) == 2:
                    # Calculate confidence as the width of the interval
                    confidence = 1.0 - (ci[1] - ci[0]) / 100.0
                    total_confidence += max(0, confidence)
                    count += 1
        
        return total_confidence / count if count > 0 else 0.0
