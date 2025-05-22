import { fieldConfig, FieldConfig, FieldOption } from '../field-config';

describe('Field Configuration', () => {
  it('should have mandatory fields defined', () => {
    expect(fieldConfig.mandatory).toBeDefined();
    expect(Array.isArray(fieldConfig.mandatory)).toBe(true);
    expect(fieldConfig.mandatory.length).toBeGreaterThan(0);
  });

  it('should have optional fields defined', () => {
    expect(fieldConfig.optional).toBeDefined();
    expect(Array.isArray(fieldConfig.optional)).toBe(true);
    expect(fieldConfig.optional.length).toBeGreaterThan(0);
  });

  it('should have system generated fields defined', () => {
    expect(fieldConfig.systemGenerated).toBeDefined();
    expect(Array.isArray(fieldConfig.systemGenerated)).toBe(true);
    expect(fieldConfig.systemGenerated.length).toBeGreaterThan(0);
  });

  it('should have required mandatory fields', () => {
    const mandatoryFieldNames = fieldConfig.mandatory.map(field => field.name);
    
    expect(mandatoryFieldNames).toContain('USER_ID');
    expect(mandatoryFieldNames).toContain('FIRST_NAME');
    expect(mandatoryFieldNames).toContain('LAST_NAME');
    expect(mandatoryFieldNames).toContain('UPDATED_BY');
    expect(mandatoryFieldNames).toContain('STATUS');
  });

  it('should have all mandatory fields with required properties', () => {
    fieldConfig.mandatory.forEach(field => {
      expect(field).toHaveProperty('name');
      expect(field).toHaveProperty('type');
      expect(field).toHaveProperty('label');
      expect(typeof field.name).toBe('string');
      expect(typeof field.type).toBe('string');
      expect(typeof field.label).toBe('string');
      expect(['text', 'email', 'tel', 'number', 'select']).toContain(field.type);
    });
  });

  it('should have all optional fields with required properties', () => {
    fieldConfig.optional.forEach(field => {
      expect(field).toHaveProperty('name');
      expect(field).toHaveProperty('type');
      expect(field).toHaveProperty('label');
      expect(typeof field.name).toBe('string');
      expect(typeof field.type).toBe('string');
      expect(typeof field.label).toBe('string');
      expect(['text', 'email', 'tel', 'number', 'select']).toContain(field.type);
    });
  });

  it('should have select fields with options', () => {
    const selectFields = [...fieldConfig.mandatory, ...fieldConfig.optional]
      .filter(field => field.type === 'select');
    
    selectFields.forEach(field => {
      expect(field).toHaveProperty('options');
      expect(Array.isArray(field.options)).toBe(true);
      expect(field.options!.length).toBeGreaterThan(0);
    });
  });

  it('should have valid maxLength for text fields', () => {
    const textFields = [...fieldConfig.mandatory, ...fieldConfig.optional]
      .filter(field => ['text', 'email', 'tel'].includes(field.type));
    
    textFields.forEach(field => {
      if (field.maxLength) {
        expect(typeof field.maxLength).toBe('number');
        expect(field.maxLength).toBeGreaterThan(0);
      }
    });
  });

  it('should have STATUS field with valid options', () => {
    const statusField = fieldConfig.mandatory.find(field => field.name === 'STATUS');
    expect(statusField).toBeDefined();
    expect(statusField!.options).toContain('Active');
    expect(statusField!.options).toContain('Inactive');
  });

  it('should have no duplicate field names across mandatory and optional', () => {
    const mandatoryNames = fieldConfig.mandatory.map(field => field.name);
    const optionalNames = fieldConfig.optional.map(field => field.name);
    
    const duplicates = mandatoryNames.filter(name => optionalNames.includes(name));
    expect(duplicates).toEqual([]);
  });

  it('should have system generated fields as strings', () => {
    fieldConfig.systemGenerated.forEach(fieldName => {
      expect(typeof fieldName).toBe('string');
      expect(fieldName.length).toBeGreaterThan(0);
    });
  });

  it('should include expected system generated fields', () => {
    expect(fieldConfig.systemGenerated).toContain('USER_KEY');
    expect(fieldConfig.systemGenerated).toContain('UPDATED_DATE');
    expect(fieldConfig.systemGenerated).toContain('EFFECTIVE_BEGIN_DT');
  });

  it('should have boolean select fields with Y/N options', () => {
    const booleanFields = fieldConfig.optional.filter(field => 
      field.name === 'ENABLE_MFA' || field.name === 'RESTRICT_CASE_CREATION'
    );
    
    booleanFields.forEach(field => {
      expect(field.type).toBe('select');
      expect(field.options).toBeDefined();
      
      const hasYesOption = field.options!.some(option => 
        (typeof option === 'object' && option.value === 'Y') || option === 'Y'
      );
      const hasNoOption = field.options!.some(option => 
        (typeof option === 'object' && option.value === 'N') || option === 'N'
      );
      
      expect(hasYesOption).toBe(true);
      expect(hasNoOption).toBe(true);
    });
  });

  it('should have email field with correct type', () => {
    const emailField = fieldConfig.optional.find(field => field.name === 'EMAIL_ADDRESS');
    expect(emailField).toBeDefined();
    expect(emailField!.type).toBe('email');
  });

  it('should have phone fields with correct type', () => {
    const phoneFields = fieldConfig.optional.filter(field => 
      field.name === 'PHONE_NUMBER' || field.name === 'MOBILE_PHONE_NUMBER' || field.name === 'FAX_NUMBER'
    );
    
    phoneFields.forEach(field => {
      expect(field.type).toBe('tel');
    });
  });

  it('should have number fields with correct type', () => {
    const numberFields = fieldConfig.optional.filter(field => 
      field.name === 'CASE_QUEUE_MAX' || field.name === 'PPA_CASE_AMT_LIMIT' || 
      field.name === 'PPA_DURATION_LIMIT' || field.name === 'CORE'
    );
    
    numberFields.forEach(field => {
      expect(field.type).toBe('number');
    });
  });
});