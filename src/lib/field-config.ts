export interface FieldOption {
  value: string;
  label: string;
}

export interface FieldConfig {
  name: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'select';
  maxLength?: number;
  label: string;
  options?: (string | FieldOption)[];
}

export const fieldConfig = {
  mandatory: [
    { name: 'USER_ID', type: 'text', maxLength: 128, label: 'User ID' },
    { name: 'FIRST_NAME', type: 'text', maxLength: 20, label: 'First Name' },
    { name: 'LAST_NAME', type: 'text', maxLength: 20, label: 'Last Name' },
    { name: 'UPDATED_BY', type: 'text', maxLength: 128, label: 'Updated By' },
    { name: 'STATUS', type: 'select', maxLength: 25, label: 'Status',
      options: ['Active', 'Inactive', 'Suspended', 'Pending'] },
  ] as FieldConfig[],
  
  optional: [
    { name: 'USER_TYPE', type: 'select', maxLength: 25, label: 'User Type', 
      options: ['Admin', 'Standard', 'Read-Only', 'Manager'] },
    { name: 'MIDDLE_INITIAL', type: 'text', maxLength: 1, label: 'Middle Initial' },
    { name: 'PHONE_NUMBER', type: 'tel', maxLength: 20, label: 'Phone Number' },
    { name: 'PHONE_EXT', type: 'text', maxLength: 5, label: 'Phone Extension' },
    { name: 'FAX_NUMBER', type: 'tel', maxLength: 20, label: 'Fax Number' },
    { name: 'OFFICE_CODE', type: 'text', maxLength: 25, label: 'Office Code' },
    { name: 'ADDRESS_LINE_1', type: 'text', maxLength: 80, label: 'Address Line 1' },
    { name: 'ADDRESS_LINE_2', type: 'text', maxLength: 80, label: 'Address Line 2' },
    { name: 'CITY', type: 'text', maxLength: 50, label: 'City' },
    { name: 'STATE_PROVINCE', type: 'text', maxLength: 50, label: 'State/Province' },
    { name: 'POSTAL_CODE', type: 'text', maxLength: 10, label: 'Postal Code' },
    { name: 'COUNTRY_REGION', type: 'text', maxLength: 40, label: 'Country/Region' },
    { name: 'COMMENTS', type: 'text', maxLength: 30, label: 'Comments' },
    { name: 'USER_LEVEL', type: 'select', maxLength: 20, label: 'User Level',
      options: ['Level 1', 'Level 2', 'Level 3', 'Supervisor', 'Manager'] },
    { name: 'EMPLOYEE_ID', type: 'text', maxLength: 30, label: 'Employee ID' },
    { name: 'TITLE', type: 'text', maxLength: 30, label: 'Job Title' },
    { name: 'EMAIL_ADDRESS', type: 'email', maxLength: 1024, label: 'Email Address' },
    { name: 'MOBILE_PHONE_NUMBER', type: 'tel', maxLength: 20, label: 'Mobile Phone' },
    { name: 'CASE_QUEUE_MAX', type: 'number', label: 'Case Queue Maximum' },
    { name: 'RESTRICT_CASE_CREATION', type: 'select', label: 'Restrict Case Creation',
      options: [{ value: 'Y', label: 'Yes' }, { value: 'N', label: 'No' }] },
    { name: 'PPA_CASE_AMT_LIMIT', type: 'number', label: 'PPA Case Amount Limit' },
    { name: 'PPA_DURATION_LIMIT', type: 'number', label: 'PPA Duration Limit' },
    { name: 'CORE', type: 'number', label: 'Core' },
    { name: 'ENABLE_MFA', type: 'select', label: 'Enable MFA',
      options: [{ value: 'Y', label: 'Yes' }, { value: 'N', label: 'No' }] }
  ] as FieldConfig[],

  systemGenerated: [
    'USER_KEY',
    'UPDATED_DATE', 
    'EFFECTIVE_BEGIN_DT',
    'PASSWORD_CHANGED_DATE',
    'LOGGED_IN_FLAG',
    'OVERRIDE_PROHIBIT_FLAG',
    'IGNORE_LOGIN_DATE'
  ]
};