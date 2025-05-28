from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List, Any, Dict
from datetime import datetime
from app.core.field_config import get_mandatory_field_names, get_field_defaults


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
    EMAIL_ADDRESS: Optional[EmailStr] = Field(None, max_length=1024)
    MOBILE_PHONE_NUMBER: Optional[str] = Field(None, max_length=20)
    CASE_QUEUE_MAX: Optional[int] = Field(default=0)
    RESTRICT_CASE_CREATION: Optional[str] = Field(default="N", max_length=1)
    PPA_CASE_AMT_LIMIT: Optional[float] = None
    PPA_DURATION_LIMIT: Optional[int] = None
    CORE: Optional[int] = None
    ENABLE_MFA: Optional[str] = Field(default="Y", max_length=1)
    
    @validator("STATUS")
    def validate_status(cls, v):
        valid_statuses = ["Active", "Inactive", "Suspended", "Pending"]
        if v not in valid_statuses:
            raise ValueError(f"Status must be one of: {', '.join(valid_statuses)}")
        return v
    
    @validator("ENABLE_MFA", "RESTRICT_CASE_CREATION")
    def validate_yn_fields(cls, v):
        if v and v not in ["Y", "N"]:
            raise ValueError("Value must be 'Y' or 'N'")
        return v


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
    EMAIL_ADDRESS: Optional[EmailStr] = Field(None, max_length=1024)
    MOBILE_PHONE_NUMBER: Optional[str] = Field(None, max_length=20)
    CASE_QUEUE_MAX: Optional[int] = None
    RESTRICT_CASE_CREATION: Optional[str] = Field(None, max_length=1)
    PPA_CASE_AMT_LIMIT: Optional[float] = None
    PPA_DURATION_LIMIT: Optional[int] = None
    CORE: Optional[int] = None
    ENABLE_MFA: Optional[str] = Field(None, max_length=1)
    
    class Config:
        extra = "forbid"  # Don't allow extra fields


class User(UserBase):
    """Schema for user response including system fields"""
    USER_KEY: int
    UPDATED_DATE: datetime
    EFFECTIVE_BEGIN_DT: Optional[datetime] = None
    PASSWORD_CHANGED_DATE: Optional[datetime] = None
    LOGGED_IN_FLAG: Optional[str] = None
    OVERRIDE_PROHIBIT_FLAG: Optional[str] = None
    IGNORE_LOGIN_DATE: Optional[datetime] = None
    
    class Config:
        from_attributes = True


class UserStatusUpdate(BaseModel):
    """Schema for updating user status"""
    status: str
    
    @validator("status")
    def validate_status(cls, v):
        valid_statuses = ["Active", "Inactive"]
        if v not in valid_statuses:
            raise ValueError(f"Status must be one of: {', '.join(valid_statuses)}")
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