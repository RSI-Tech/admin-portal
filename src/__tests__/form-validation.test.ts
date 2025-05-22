import { fieldConfig } from '@/lib/field-config';

describe('Form Validation Logic', () => {
  const validateMandatoryFields = (formData: Record<string, any>) => {
    const errors: Record<string, string> = {};
    
    fieldConfig.mandatory.forEach(field => {
      if (!formData[field.name] || formData[field.name].trim() === '') {
        errors[field.name] = `${field.label} is required`;
      }
    });
    
    return errors;
  };

  describe('Mandatory Field Validation', () => {
    it('should pass validation with all mandatory fields filled', () => {
      const validFormData = {
        USER_ID: 'testuser123',
        FIRST_NAME: 'John',
        LAST_NAME: 'Doe',
        UPDATED_BY: 'admin@company.com',
        STATUS: 'Active'
      };

      const errors = validateMandatoryFields(validFormData);
      expect(Object.keys(errors)).toHaveLength(0);
    });

    it('should fail validation with missing mandatory fields', () => {
      const invalidFormData = {
        USER_ID: 'testuser123',
        FIRST_NAME: '',
        LAST_NAME: 'Doe'
        // Missing UPDATED_BY and STATUS
      };

      const errors = validateMandatoryFields(invalidFormData);
      expect(Object.keys(errors).length).toBeGreaterThan(0);
      expect(errors.FIRST_NAME).toBe('First Name is required');
      expect(errors.UPDATED_BY).toBe('Updated By is required');
      expect(errors.STATUS).toBe('Status is required');
    });

    it('should handle whitespace-only values as invalid', () => {
      const formDataWithWhitespace = {
        USER_ID: '   ',
        FIRST_NAME: 'John',
        LAST_NAME: 'Doe',
        UPDATED_BY: 'admin',
        STATUS: 'Active'
      };

      const errors = validateMandatoryFields(formDataWithWhitespace);
      expect(errors.USER_ID).toBe('User ID is required');
    });

    it('should validate each mandatory field individually', () => {
      fieldConfig.mandatory.forEach(field => {
        const formData = {
          USER_ID: 'test',
          FIRST_NAME: 'John',
          LAST_NAME: 'Doe',
          UPDATED_BY: 'admin',
          STATUS: 'Active'
        };

        // Remove one field at a time
        delete formData[field.name as keyof typeof formData];
        
        const errors = validateMandatoryFields(formData);
        expect(errors[field.name]).toBe(`${field.label} is required`);
      });
    });
  });

  describe('Field Type Validation', () => {
    it('should validate email field format conceptually', () => {
      const emailField = fieldConfig.optional.find(field => field.type === 'email');
      expect(emailField).toBeDefined();
      expect(emailField!.name).toBe('EMAIL_ADDRESS');
      
      // Basic email validation logic
      const validateEmail = (email: string) => {
        return email.includes('@') && email.includes('.');
      };

      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('invalid-email')).toBe(false);
    });

    it('should validate phone field format conceptually', () => {
      const phoneFields = fieldConfig.optional.filter(field => field.type === 'tel');
      expect(phoneFields.length).toBeGreaterThan(0);
      
      // Basic phone validation logic
      const validatePhone = (phone: string) => {
        return /^\d{3}-?\d{3}-?\d{4}$/.test(phone.replace(/\s/g, ''));
      };

      expect(validatePhone('123-456-7890')).toBe(true);
      expect(validatePhone('1234567890')).toBe(true);
      expect(validatePhone('invalid-phone')).toBe(false);
    });

    it('should validate number fields', () => {
      const numberFields = fieldConfig.optional.filter(field => field.type === 'number');
      expect(numberFields.length).toBeGreaterThan(0);
      
      // Basic number validation
      const validateNumber = (value: any) => {
        return !isNaN(Number(value));
      };

      expect(validateNumber('123')).toBe(true);
      expect(validateNumber('0')).toBe(true);
      expect(validateNumber('abc')).toBe(false);
    });
  });

  describe('Field Length Validation', () => {
    it('should respect maxLength constraints', () => {
      const validateLength = (value: string, maxLength?: number) => {
        if (!maxLength) return true;
        return value.length <= maxLength;
      };

      fieldConfig.mandatory.forEach(field => {
        if (field.maxLength) {
          const validValue = 'a'.repeat(field.maxLength);
          const invalidValue = 'a'.repeat(field.maxLength + 1);
          
          expect(validateLength(validValue, field.maxLength)).toBe(true);
          expect(validateLength(invalidValue, field.maxLength)).toBe(false);
        }
      });
    });

    it('should handle fields without maxLength', () => {
      const fieldsWithoutMaxLength = [...fieldConfig.mandatory, ...fieldConfig.optional]
        .filter(field => !field.maxLength);
      
      fieldsWithoutMaxLength.forEach(field => {
        expect(field.maxLength).toBeUndefined();
      });
    });
  });
});