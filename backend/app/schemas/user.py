from pydantic import BaseModel, Field, field_validator
from typing import Optional, List, Any, Dict, Union
from datetime import datetime
from app.core.field_config import get_mandatory_field_names, get_field_defaults


def parse_datetime_or_string(value: Any) -> Optional[Union[datetime, str]]:
    """Parse datetime fields that might contain 'N' or other non-date values"""
    if value is None or value == 'N' or value == '':
        return None
    if isinstance(value, datetime):
        return value
    if isinstance(value, str):
        try:
            # Try to parse as datetime
            return datetime.fromisoformat(value.replace('Z', '+00:00'))
        except:
            # If it fails, return None
            return None
    return None


def parse_email_or_string(value: Any) -> Optional[str]:
    """Parse email fields that might contain placeholder values"""
    if value is None or value == '' or value == 'EMAIL':
        return None
    return str(value)


class UserBase(BaseModel):
    USER_ID: str = Field(..., max_length=128)
    FIRST_NAME: str = Field(..., max_length=20)
    LAST_NAME: str = Field(..., max_length=20)
    STATUS: str = Field(..., max_length=25)
    UPDATED_BY: str = Field(..., max_length=128)
    
    # Optional fields
    USER_TYPE: Optional[str] = Field(None, max_length=25)
    MIDDLE_INITIAL: Optional[str] = Field(None, max_length=1)
    PHONE_NUMBER: Optional[str] = Field(None, max_length=20)
    PHONE_EXT: Optional[str] = Field(None, max_length=5)
    FAX_NUMBER: Optional[str] = Field(None, max_length=20)
    OFFICE_CODE: Optional[str] = Field(None, max_length=25)
    ADDRESS_LINE_1: Optional[str] = Field(None, max_length=80)
    ADDRESS_LINE_2: Optional[str] = Field(None, max_length=80)
    CITY: Optional[str] = Field(None, max_length=50)
    STATE_PROVINCE: Optional[str] = Field(None, max_length=50)
    POSTAL_CODE: Optional[str] = Field(None, max_length=10)
    COUNTRY_REGION: Optional[str] = Field(None, max_length=40)
    COMMENTS: Optional[str] = Field(None, max_length=30)
    USER_LEVEL: Optional[str] = Field(None, max_length=20)
    EMPLOYEE_ID: Optional[str] = Field(None, max_length=30)
    TITLE: Optional[str] = Field(None, max_length=30)
    EMAIL_ADDRESS: Optional[str] = Field(None, max_length=1024)
    MOBILE_PHONE_NUMBER: Optional[str] = Field(None, max_length=20)
    CASE_QUEUE_MAX: Optional[int] = Field(default=0)
    RESTRICT_CASE_CREATION: Optional[str] = Field(default="N", max_length=1)
    PPA_CASE_AMT_LIMIT: Optional[float] = None
    PPA_DURATION_LIMIT: Optional[int] = None
    CORE: Optional[int] = None
    ENABLE_MFA: Optional[str] = Field(default="Y", max_length=1)
    
    @field_validator("STATUS")
    @classmethod
    def normalize_status(cls, v):
        """Normalize status values from database"""
        if v is None:
            return None
        # Map common abbreviations to full status
        status_map = {
            'A': 'Active',
            'I': 'Inactive',
            'S': 'Suspended',
            'P': 'Pending',
            'ACTIVE': 'Active',
            'INACTIVE': 'Inactive',
            'SUSPENDED': 'Suspended',
            'PENDING': 'Pending'
        }
        v_upper = str(v).upper().strip()
        return status_map.get(v_upper, v)
    
    @field_validator("EMAIL_ADDRESS", mode='before')
    @classmethod
    def validate_email(cls, v):
        """Handle invalid email placeholders"""
        return parse_email_or_string(v)
    
    @field_validator("ENABLE_MFA", "RESTRICT_CASE_CREATION")
    @classmethod
    def validate_yn_fields(cls, v):
        if v and v not in ["Y", "N", "y", "n"]:
            return "N"  # Default to N if invalid
        return v.upper() if v else "N"


class UserCreate(UserBase):
    """Schema for creating a new user"""
    pass


class UserUpdate(BaseModel):
    """Schema for updating an existing user - all fields optional"""
    USER_ID: Optional[str] = Field(None, max_length=128)
    FIRST_NAME: Optional[str] = Field(None, max_length=20)
    LAST_NAME: Optional[str] = Field(None, max_length=20)
    STATUS: Optional[str] = Field(None, max_length=25)
    UPDATED_BY: Optional[str] = Field(None, max_length=128)
    USER_TYPE: Optional[str] = Field(None, max_length=25)
    MIDDLE_INITIAL: Optional[str] = Field(None, max_length=1)
    PHONE_NUMBER: Optional[str] = Field(None, max_length=20)
    PHONE_EXT: Optional[str] = Field(None, max_length=5)
    FAX_NUMBER: Optional[str] = Field(None, max_length=20)
    OFFICE_CODE: Optional[str] = Field(None, max_length=25)
    ADDRESS_LINE_1: Optional[str] = Field(None, max_length=80)
    ADDRESS_LINE_2: Optional[str] = Field(None, max_length=80)
    CITY: Optional[str] = Field(None, max_length=50)
    STATE_PROVINCE: Optional[str] = Field(None, max_length=50)
    POSTAL_CODE: Optional[str] = Field(None, max_length=10)
    COUNTRY_REGION: Optional[str] = Field(None, max_length=40)
    COMMENTS: Optional[str] = Field(None, max_length=30)
    USER_LEVEL: Optional[str] = Field(None, max_length=20)
    EMPLOYEE_ID: Optional[str] = Field(None, max_length=30)
    TITLE: Optional[str] = Field(None, max_length=30)
    EMAIL_ADDRESS: Optional[str] = Field(None, max_length=1024)
    MOBILE_PHONE_NUMBER: Optional[str] = Field(None, max_length=20)
    CASE_QUEUE_MAX: Optional[int] = None
    RESTRICT_CASE_CREATION: Optional[str] = Field(None, max_length=1)
    PPA_CASE_AMT_LIMIT: Optional[float] = None
    PPA_DURATION_LIMIT: Optional[int] = None
    CORE: Optional[int] = None
    ENABLE_MFA: Optional[str] = Field(None, max_length=1)
    
    class Config:
        extra = "ignore"  # Ignore extra fields instead of forbidding them


class User(UserBase):
    """Schema for user response including system fields"""
    USER_KEY: int
    UPDATED_DATE: Optional[datetime] = None
    EFFECTIVE_BEGIN_DT: Optional[datetime] = None
    EFFECTIVE_END_DT: Optional[datetime] = None
    PASSWORD_CHANGED_DATE: Optional[datetime] = None
    LOGGED_IN_FLAG: Optional[str] = None
    OVERRIDE_PROHIBIT_FLAG: Optional[str] = None
    IGNORE_LOGIN_DATE: Optional[Union[datetime, str]] = None
    
    # Additional database fields
    LAST_LOGIN_CLIENT: Optional[str] = None
    LAST_LOGIN_IP_ADDRESS: Optional[str] = None
    LAST_LOGIN_DATE: Optional[datetime] = None
    LAST_LOCAL_SYNC_DATE: Optional[datetime] = None
    LAST_CENTRAL_SYNC_DATE: Optional[datetime] = None
    LEGACY_ID: Optional[str] = None
    CUSTOM_SID: Optional[str] = None
    DEFAULT_PRINTER_CODE: Optional[str] = None
    
    # User attributes (10 sets)
    USER_ATTR_TYPE_1: Optional[str] = None
    USER_ATTR_VALUE_1: Optional[str] = None
    USER_ATTR_EFF_BEGIN_DT_1: Optional[datetime] = None
    USER_ATTR_EFF_END_DT_1: Optional[datetime] = None
    USER_ATTR_TYPE_2: Optional[str] = None
    USER_ATTR_VALUE_2: Optional[str] = None
    USER_ATTR_EFF_BEGIN_DT_2: Optional[datetime] = None
    USER_ATTR_EFF_END_DT_2: Optional[datetime] = None
    USER_ATTR_TYPE_3: Optional[str] = None
    USER_ATTR_VALUE_3: Optional[str] = None
    USER_ATTR_EFF_BEGIN_DT_3: Optional[datetime] = None
    USER_ATTR_EFF_END_DT_3: Optional[datetime] = None
    USER_ATTR_TYPE_4: Optional[str] = None
    USER_ATTR_VALUE_4: Optional[str] = None
    USER_ATTR_EFF_BEGIN_DT_4: Optional[datetime] = None
    USER_ATTR_EFF_END_DT_4: Optional[datetime] = None
    USER_ATTR_TYPE_5: Optional[str] = None
    USER_ATTR_VALUE_5: Optional[str] = None
    USER_ATTR_EFF_BEGIN_DT_5: Optional[datetime] = None
    USER_ATTR_EFF_END_DT_5: Optional[datetime] = None
    USER_ATTR_TYPE_6: Optional[str] = None
    USER_ATTR_VALUE_6: Optional[str] = None
    USER_ATTR_EFF_BEGIN_DT_6: Optional[datetime] = None
    USER_ATTR_EFF_END_DT_6: Optional[datetime] = None
    USER_ATTR_TYPE_7: Optional[str] = None
    USER_ATTR_VALUE_7: Optional[str] = None
    USER_ATTR_EFF_BEGIN_DT_7: Optional[datetime] = None
    USER_ATTR_EFF_END_DT_7: Optional[datetime] = None
    USER_ATTR_TYPE_8: Optional[str] = None
    USER_ATTR_VALUE_8: Optional[str] = None
    USER_ATTR_EFF_BEGIN_DT_8: Optional[datetime] = None
    USER_ATTR_EFF_END_DT_8: Optional[datetime] = None
    USER_ATTR_TYPE_9: Optional[str] = None
    USER_ATTR_VALUE_9: Optional[str] = None
    USER_ATTR_EFF_BEGIN_DT_9: Optional[datetime] = None
    USER_ATTR_EFF_END_DT_9: Optional[datetime] = None
    USER_ATTR_TYPE_10: Optional[str] = None
    USER_ATTR_VALUE_10: Optional[str] = None
    USER_ATTR_EFF_BEGIN_DT_10: Optional[datetime] = None
    USER_ATTR_EFF_END_DT_10: Optional[datetime] = None
    
    @field_validator("UPDATED_DATE", "EFFECTIVE_BEGIN_DT", "EFFECTIVE_END_DT", "PASSWORD_CHANGED_DATE", 
                      "LAST_LOGIN_DATE", "LAST_LOCAL_SYNC_DATE", "LAST_CENTRAL_SYNC_DATE",
                      "USER_ATTR_EFF_BEGIN_DT_1", "USER_ATTR_EFF_END_DT_1",
                      "USER_ATTR_EFF_BEGIN_DT_2", "USER_ATTR_EFF_END_DT_2",
                      "USER_ATTR_EFF_BEGIN_DT_3", "USER_ATTR_EFF_END_DT_3",
                      "USER_ATTR_EFF_BEGIN_DT_4", "USER_ATTR_EFF_END_DT_4",
                      "USER_ATTR_EFF_BEGIN_DT_5", "USER_ATTR_EFF_END_DT_5",
                      "USER_ATTR_EFF_BEGIN_DT_6", "USER_ATTR_EFF_END_DT_6",
                      "USER_ATTR_EFF_BEGIN_DT_7", "USER_ATTR_EFF_END_DT_7",
                      "USER_ATTR_EFF_BEGIN_DT_8", "USER_ATTR_EFF_END_DT_8",
                      "USER_ATTR_EFF_BEGIN_DT_9", "USER_ATTR_EFF_END_DT_9",
                      "USER_ATTR_EFF_BEGIN_DT_10", "USER_ATTR_EFF_END_DT_10", mode='before')
    @classmethod
    def parse_dates(cls, v):
        """Handle datetime fields"""
        return parse_datetime_or_string(v)
    
    @field_validator("IGNORE_LOGIN_DATE", mode='before')
    @classmethod
    def parse_ignore_login_date(cls, v):
        """Handle IGNORE_LOGIN_DATE which might be 'N' or a date"""
        if v == 'N' or v == 'n':
            return None
        return parse_datetime_or_string(v)
    
    class Config:
        from_attributes = True
        # Allow arbitrary types for datetime handling
        arbitrary_types_allowed = True


class UserStatusUpdate(BaseModel):
    """Schema for updating user status"""
    status: str
    
    @field_validator("status")
    @classmethod
    def validate_status(cls, v):
        valid_statuses = ["Active", "Inactive", "A", "I"]
        if v not in valid_statuses:
            raise ValueError(f"Status must be one of: {', '.join(valid_statuses)}")
        # Normalize to full status
        if v == "A":
            return "Active"
        elif v == "I":
            return "Inactive"
        return v


class UserList(BaseModel):
    """Response for user list"""
    users: List[User]
    total: int


class UserFilter(BaseModel):
    """Query parameters for filtering users"""
    search: Optional[str] = None
    user_type: Optional[str] = None
    status: Optional[str] = None
    profile_id: Optional[str] = None
    skip: int = 0
    limit: int = 100