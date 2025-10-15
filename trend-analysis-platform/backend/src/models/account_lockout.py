"""
Account lockout models for tracking failed login attempts
"""
from datetime import datetime, timedelta
from typing import Optional, List
import enum

Base = declarative_base()

class LockoutReason(enum.Enum):
    """Reasons for account lockout"""
    FAILED_LOGIN = "failed_login"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    ADMIN_LOCK = "admin_lock"
    PASSWORD_BREACH = "password_breach"
    RATE_LIMIT = "rate_limit"

class AccountLockout:
    """Simple data class for AccountLockout - use Supabase for database operations"""
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

class FailedLoginAttempt(Base):
    """Failed login attempt tracking"""
    # __tablename__ = "failed_login_attempts"

    # id = Column(Integer, primary_key=True, index=True)
    # user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)  # Nullable for unknown users
    # email = Column(String(255), nullable=False, index=True)
    # ip_address = Column(String(45), nullable=False, index=True)
    # user_agent = Column(Text, nullable=True)
    # attempt_time = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # failure_reason = Column(String(100), nullable=True)  # wrong_password, user_not_found, etc.
    # is_suspicious = Column(Boolean, default=False, nullable=False)
    # geolocation = Column(String(100), nullable=True)  # Country, city
    # device_fingerprint = Column(String(255), nullable=True)
    # created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    # user = relationship("User", foreign_keys=[user_id])

    def is_recent(self, minutes: int = 15) -> bool:
        """Check if attempt is within recent time window"""
        return self.attempt_time > datetime.utcnow() - timedelta(minutes=minutes)

class SecurityEvent(Base):
    """Security events tracking"""
    # __tablename__ = "security_events"

    # id = Column(Integer, primary_key=True, index=True)
    # user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    # event_type = Column(String(50), nullable=False, index=True)
    # event_description = Column(Text, nullable=False)
    # ip_address = Column(String(45), nullable=True)
    # user_agent = Column(Text, nullable=True)
    # severity = Column(String(20), nullable=False, default="medium")  # low, medium, high, critical
    # event_metadata = Column(Text, nullable=True)  # JSON string for additional data
    # is_resolved = Column(Boolean, default=False, nullable=False)
    # resolved_at = Column(DateTime(timezone=True), nullable=True)
    # resolved_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    # created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    # user = relationship("User", foreign_keys=[user_id])
    # resolver = relationship("User", foreign_keys=[resolved_by])

class PasswordBreach(Base):
    """Password breach tracking"""
    # __tablename__ = "password_breaches"

    # id = Column(Integer, primary_key=True, index=True)
    # user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    # breach_source = Column(String(100), nullable=False)  # haveibeenpwned, internal, etc.
    # breach_date = Column(DateTime(timezone=True), nullable=True)
    # breach_description = Column(Text, nullable=True)
    # password_hash = Column(String(255), nullable=True)  # Hash of breached password
    # is_resolved = Column(Boolean, default=False, nullable=False)
    # resolved_at = Column(DateTime(timezone=True), nullable=True)
    # created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    # user = relationship("User", foreign_keys=[user_id])

class SuspiciousActivity(Base):
    """Suspicious activity tracking"""
    # __tablename__ = "suspicious_activities"

    # id = Column(Integer, primary_key=True, index=True)
    # user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    # activity_type = Column(String(50), nullable=False, index=True)
    # description = Column(Text, nullable=False)
    # ip_address = Column(String(45), nullable=True)
    # user_agent = Column(Text, nullable=True)
    # geolocation = Column(String(100), nullable=True)
    # risk_score = Column(Integer, default=0, nullable=False)  # 0-100
    # is_investigated = Column(Boolean, default=False, nullable=False)
    # investigation_notes = Column(Text, nullable=True)
    # created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    # user = relationship("User", foreign_keys=[user_id])

# Update User model to include relationships
# This would be added to the existing User model
"""
# Add these relationships to the User model:
# lockouts = relationship("AccountLockout", foreign_keys="AccountLockout.user_id", back_populates="user")
# failed_login_attempts = relationship("FailedLoginAttempt", foreign_keys="FailedLoginAttempt.user_id")
# security_events = relationship("SecurityEvent", foreign_keys="SecurityEvent.user_id")
# password_breaches = relationship("PasswordBreach", foreign_keys="PasswordBreach.user_id")
# suspicious_activities = relationship("SuspiciousActivity", foreign_keys="SuspiciousActivity.user_id")
"""
