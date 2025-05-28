from typing import List, Dict, Any, Optional, Union
from enum import Enum


class FieldType(str, Enum):
    TEXT = "text"
    EMAIL = "email"
    TEL = "tel"
    NUMBER = "number"
    SELECT = "select"


class FieldConfig:
    """Field configuration for user form fields"""
    
    def __init__(self, name: str, field_type: FieldType, label: str, 
                 max_length: Optional[int] = None, 
                 options: Optional[List[Union[str, Dict[str, str]]]] = None):
        self.name = name
        self.type = field_type
        self.label = label
        self.max_length = max_length
        self.options = options
    
    def to_dict(self) -> Dict[str, Any]:
        config = {
            "name": self.name,
            "type": self.type.value,
            "label": self.label
        }
        if self.max_length:
            config["maxLength"] = self.max_length
        if self.options:
            config["options"] = self.options
        return config


# Field configurations matching the TypeScript version
MANDATORY_FIELDS = [
    FieldConfig("USER_ID", FieldType.TEXT, "User ID", max_length=128),
    FieldConfig("FIRST_NAME", FieldType.TEXT, "First Name", max_length=20),
    FieldConfig("LAST_NAME", FieldType.TEXT, "Last Name", max_length=20),
    FieldConfig("UPDATED_BY", FieldType.TEXT, "Updated By", max_length=128),
    FieldConfig("STATUS", FieldType.SELECT, "Status", max_length=25,
                options=["Active", "Inactive", "Suspended", "Pending"]),
]

OPTIONAL_FIELDS = [
    FieldConfig("USER_TYPE", FieldType.SELECT, "User Type", max_length=25,
                options=["Admin", "Standard", "Read-Only", "Manager"]),
    FieldConfig("MIDDLE_INITIAL", FieldType.TEXT, "Middle Initial", max_length=1),
    FieldConfig("PHONE_NUMBER", FieldType.TEL, "Phone Number", max_length=20),
    FieldConfig("PHONE_EXT", FieldType.TEXT, "Phone Extension", max_length=5),
    FieldConfig("FAX_NUMBER", FieldType.TEL, "Fax Number", max_length=20),
    FieldConfig("OFFICE_CODE", FieldType.TEXT, "Office Code", max_length=25),
    FieldConfig("ADDRESS_LINE_1", FieldType.TEXT, "Address Line 1", max_length=80),
    FieldConfig("ADDRESS_LINE_2", FieldType.TEXT, "Address Line 2", max_length=80),
    FieldConfig("CITY", FieldType.TEXT, "City", max_length=50),
    FieldConfig("STATE_PROVINCE", FieldType.TEXT, "State/Province", max_length=50),
    FieldConfig("POSTAL_CODE", FieldType.TEXT, "Postal Code", max_length=10),
    FieldConfig("COUNTRY_REGION", FieldType.TEXT, "Country/Region", max_length=40),
    FieldConfig("COMMENTS", FieldType.TEXT, "Comments", max_length=30),
    FieldConfig("USER_LEVEL", FieldType.SELECT, "User Level", max_length=20,
                options=["Level 1", "Level 2", "Level 3", "Supervisor", "Manager"]),
    FieldConfig("EMPLOYEE_ID", FieldType.TEXT, "Employee ID", max_length=30),
    FieldConfig("TITLE", FieldType.TEXT, "Job Title", max_length=30),
    FieldConfig("EMAIL_ADDRESS", FieldType.EMAIL, "Email Address", max_length=1024),
    FieldConfig("MOBILE_PHONE_NUMBER", FieldType.TEL, "Mobile Phone", max_length=20),
    FieldConfig("CASE_QUEUE_MAX", FieldType.NUMBER, "Case Queue Maximum"),
    FieldConfig("RESTRICT_CASE_CREATION", FieldType.SELECT, "Restrict Case Creation",
                options=[{"value": "Y", "label": "Yes"}, {"value": "N", "label": "No"}]),
    FieldConfig("PPA_CASE_AMT_LIMIT", FieldType.NUMBER, "PPA Case Amount Limit"),
    FieldConfig("PPA_DURATION_LIMIT", FieldType.NUMBER, "PPA Duration Limit"),
    FieldConfig("CORE", FieldType.NUMBER, "Core"),
    FieldConfig("ENABLE_MFA", FieldType.SELECT, "Enable MFA",
                options=[{"value": "Y", "label": "Yes"}, {"value": "N", "label": "No"}])
]

SYSTEM_GENERATED_FIELDS = [
    "USER_KEY",
    "UPDATED_DATE",
    "EFFECTIVE_BEGIN_DT",
    "PASSWORD_CHANGED_DATE",
    "LOGGED_IN_FLAG",
    "OVERRIDE_PROHIBIT_FLAG",
    "IGNORE_LOGIN_DATE"
]


def get_field_config() -> Dict[str, Any]:
    """Get complete field configuration"""
    return {
        "mandatory": [field.to_dict() for field in MANDATORY_FIELDS],
        "optional": [field.to_dict() for field in OPTIONAL_FIELDS],
        "systemGenerated": SYSTEM_GENERATED_FIELDS
    }


def get_all_field_names() -> List[str]:
    """Get all field names (mandatory + optional)"""
    return [f.name for f in MANDATORY_FIELDS + OPTIONAL_FIELDS]


def get_mandatory_field_names() -> List[str]:
    """Get mandatory field names"""
    return [f.name for f in MANDATORY_FIELDS]


def get_field_defaults() -> Dict[str, Any]:
    """Get default values for fields"""
    return {
        "CASE_QUEUE_MAX": 0,
        "ENABLE_MFA": "Y",
        "RESTRICT_CASE_CREATION": "N"
    }