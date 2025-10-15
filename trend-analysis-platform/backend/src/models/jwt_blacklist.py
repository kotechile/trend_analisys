"""
JWT token blacklist models for token revocation
"""
from datetime import datetime, timedelta
from typing import Optional, List
import enum

Base = declarative_base()

class TokenStatus(enum.Enum):
    """Token status enumeration"""
    ACTIVE = "active"
    REVOKED = "revoked"
    EXPIRED = "expired"
    BLACKLISTED = "blacklisted"

class RevocationReason(enum.Enum):
    """Token revocation reasons"""
    USER_LOGOUT = "user_logout"
    ADMIN_REVOKE = "admin_revoke"
    SECURITY_BREACH = "security_breach"
    PASSWORD_CHANGE = "password_change"
    ACCOUNT_LOCKED = "account_locked"
    SUSPICIOUS_ACTIVITY = "suspicious_activity"
    TOKEN_EXPIRED = "token_expired"
    MANUAL_REVOKE = "manual_revoke"

class JWTBlacklist:
    """Simple data class for JWTBlacklist - use Supabase for database operations"""
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

class TokenWhitelist(Base):
    """Token whitelist for active tokens (optional optimization)"""
    # __tablename__ = "token_whitelist"

    # id = Column(Integer, primary_key=True, index=True)
    # jti = Column(String(255), nullable=False, unique=True, index=True)
    # user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    # token_type = Column(String(20), nullable=False, default="access")
    # token_hash = Column(String(255), nullable=False, index=True)
    # issued_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # expires_at = Column(DateTime(timezone=True), nullable=False, index=True)
    # ip_address = Column(String(45), nullable=True)
    # user_agent = Column(Text, nullable=True)
    # is_active = Column(Boolean, default=True, nullable=False)
    # last_used = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    # user = relationship("User", foreign_keys=[user_id])

    # Indexes for performance
    __table_args__ = (
        Index('idx_token_whitelist_user_expires', 'user_id', 'expires_at'),
        Index('idx_token_whitelist_jti_expires', 'jti', 'expires_at'),
        Index('idx_token_whitelist_active', 'is_active', 'expires_at'),
    )

    def is_expired(self) -> bool:
        """Check if token has expired"""
        return datetime.utcnow() > self.expires_at

    def is_valid(self) -> bool:
        """Check if token is valid (active and not expired)"""
        return self.is_active and not self.is_expired()

class TokenSession(Base):
    """Token session tracking for advanced security"""
    # __tablename__ = "token_sessions"

    # id = Column(Integer, primary_key=True, index=True)
    # session_id = Column(String(255), nullable=False, unique=True, index=True)
    # user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    # device_fingerprint = Column(String(255), nullable=True, index=True)
    # ip_address = Column(String(45), nullable=True, index=True)
    # user_agent = Column(Text, nullable=True)
    # geolocation = Column(String(100), nullable=True)  # Country, city
    # is_active = Column(Boolean, default=True, nullable=False)
    # last_activity = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # expires_at = Column(DateTime(timezone=True), nullable=False, index=True)

    # Relationships
    # user = relationship("User", foreign_keys=[user_id])

    def is_expired(self) -> bool:
        """Check if session has expired"""
        return datetime.utcnow() > self.expires_at

    def is_valid(self) -> bool:
        """Check if session is valid (active and not expired)"""
        return self.is_active and not self.is_expired()

class TokenAuditLog(Base):
    """Token audit log for security monitoring"""
    # __tablename__ = "token_audit_log"

    # id = Column(Integer, primary_key=True, index=True)
    # jti = Column(String(255), nullable=False, index=True)
    # user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    # action = Column(String(50), nullable=False, index=True)  # issued, used, revoked, expired
    # token_type = Column(String(20), nullable=False)
    # ip_address = Column(String(45), nullable=True)
    # user_agent = Column(Text, nullable=True)
    # geolocation = Column(String(100), nullable=True)
    # log_metadata = Column(Text, nullable=True)  # Additional context
    # created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    # user = relationship("User", foreign_keys=[user_id])

    # Indexes for performance
    __table_args__ = (
        Index('idx_token_audit_user_action', 'user_id', 'action'),
        Index('idx_token_audit_jti_action', 'jti', 'action'),
        Index('idx_token_audit_created', 'created_at'),
    )

# Update User model to include relationships
# This would be added to the existing User model:
"""
# Add these relationships to the User model:
# blacklisted_tokens = relationship("JWTBlacklist", foreign_keys="JWTBlacklist.user_id", back_populates="user")
# whitelisted_tokens = relationship("TokenWhitelist", foreign_keys="TokenWhitelist.user_id")
# token_sessions = relationship("TokenSession", foreign_keys="TokenSession.user_id")
# token_audit_logs = relationship("TokenAuditLog", foreign_keys="TokenAuditLog.user_id")
"""
