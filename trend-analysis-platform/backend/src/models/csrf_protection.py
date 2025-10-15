"""
CSRF protection models for token management
"""
from datetime import datetime, timedelta
from typing import Optional, List
import enum

Base = declarative_base()

class CSRFTokenStatus(enum.Enum):
    """CSRF token status enumeration"""
    ACTIVE = "active"
    USED = "used"
    EXPIRED = "expired"
    REVOKED = "revoked"

class CSRFProtection:
    """Simple data class for CSRFProtection - use Supabase for database operations"""
    def __init__(self, **kwargs):
        for key, value in kwargs.items():
            setattr(self, key, value)

class CSRFWhitelist(Base):
    """CSRF whitelist for trusted origins"""
    # __tablename__ = "csrf_whitelist"

    # id = Column(Integer, primary_key=True, index=True)
    # origin = Column(String(255), nullable=False, unique=True, index=True)
    # description = Column(Text, nullable=True)
    # is_active = Column(Boolean, default=True, nullable=False)
    # created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # created_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    # expires_at = Column(DateTime(timezone=True), nullable=True, index=True)

    # Relationships
    # creator = relationship("User", foreign_keys=[created_by])

    def is_expired(self) -> bool:
        """Check if whitelist entry has expired"""
        if not self.expires_at:
            return False
        return datetime.utcnow() > self.expires_at

    def is_valid(self) -> bool:
        """Check if whitelist entry is valid (active and not expired)"""
        return self.is_active and not self.is_expired()

class CSRFViolation(Base):
    """CSRF violation tracking"""
    # __tablename__ = "csrf_violations"

    # id = Column(Integer, primary_key=True, index=True)
    # user_id = Column(Integer, ForeignKey("users.id"), nullable=True, index=True)
    # ip_address = Column(String(45), nullable=False, index=True)
    # user_agent = Column(Text, nullable=True)
    # origin = Column(String(255), nullable=True)
    # referer = Column(String(255), nullable=True)
    # violation_type = Column(String(50), nullable=False, index=True)  # missing_token, invalid_token, expired_token, etc.
    # token_provided = Column(String(255), nullable=True)
    # expected_token = Column(String(255), nullable=True)
    # request_path = Column(String(255), nullable=True)
    # request_method = Column(String(10), nullable=True)
    # severity = Column(String(20), nullable=False, default="medium")  # low, medium, high, critical
    # is_blocked = Column(Boolean, default=False, nullable=False)
    # blocked_until = Column(DateTime(timezone=True), nullable=True)
    # created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    # user = relationship("User", foreign_keys=[user_id])

    # Indexes for performance
    __table_args__ = (
        Index('idx_csrf_violation_user', 'user_id', 'created_at'),
        Index('idx_csrf_violation_ip', 'ip_address', 'created_at'),
        Index('idx_csrf_violation_type', 'violation_type', 'created_at'),
        Index('idx_csrf_violation_severity', 'severity', 'created_at'),
    )

class CSRFConfiguration(Base):
    """CSRF protection configuration settings"""
    # __tablename__ = "csrf_configuration"

    # id = Column(Integer, primary_key=True, index=True)
    # setting_name = Column(String(100), nullable=False, unique=True, index=True)
    # setting_value = Column(Text, nullable=False)
    # setting_type = Column(String(20), nullable=False, default="string")  # string, int, bool, json
    # description = Column(Text, nullable=True)
    # is_active = Column(Boolean, default=True, nullable=False)
    # created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    # updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)
    # updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    # updater = relationship("User", foreign_keys=[updated_by])

    def get_typed_value(self):
        """Get the setting value with proper type conversion"""
        if self.setting_type == "int":
            return int(self.setting_value)
        elif self.setting_type == "bool":
            return self.setting_value.lower() in ("true", "1", "yes", "on")
        elif self.setting_type == "json":
            import json
            return json.loads(self.setting_value)
        else:
            return self.setting_value

# Update User model to include relationships
# This would be added to the existing User model:
"""
# Add these relationships to the User model:
# csrf_tokens = relationship("CSRFProtection", foreign_keys="CSRFProtection.user_id")
# csrf_violations = relationship("CSRFViolation", foreign_keys="CSRFViolation.user_id")
"""
