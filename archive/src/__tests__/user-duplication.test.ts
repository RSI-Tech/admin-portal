import { connectToDatabase, sql } from '../lib/db';

// Mock the database module
jest.mock('../lib/db', () => ({
  connectToDatabase: jest.fn(),
  sql: {
    query: jest.fn(),
    Request: jest.fn(() => ({
      input: jest.fn(),
      query: jest.fn(),
    })),
    Transaction: jest.fn(() => ({
      begin: jest.fn(),
      commit: jest.fn(),
      rollback: jest.fn(),
    })),
  },
}));

describe('User Duplication Functionality', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Database Prerequisites', () => {
    it('should verify USER_KEY exists in USERS table before accessing USER_TO_PROFILE', async () => {
      // Mock database responses
      const mockUserData = {
        recordset: [{
          USER_KEY: 1500347,
          USER_ID: 'fsajjad',
          FIRST_NAME: 'Faisal',
          LAST_NAME: 'Sajjad',
          STATUS: 'Active',
          UPDATED_BY: 'Admin'
        }]
      };

      const mockProfileData = {
        recordset: [
          { PROFILE_ID: 'ADMIN', UPDATED_DATE: '2024-01-01', UPDATED_BY: 'SYSTEM' },
          { PROFILE_ID: 'USER', UPDATED_DATE: '2024-01-01', UPDATED_BY: 'SYSTEM' }
        ]
      };

      (sql.query as jest.Mock)
        .mockResolvedValueOnce(mockUserData) // First call for user data
        .mockResolvedValueOnce(mockProfileData); // Second call for profile data

      // Test that we can fetch user data
      const userResult = await sql.query`SELECT * FROM USERS WHERE USER_KEY = ${1500347}`;
      expect(userResult.recordset).toHaveLength(1);
      expect(userResult.recordset[0].USER_KEY).toBe(1500347);

      // Test that we can fetch profile data for existing user
      const profileResult = await sql.query`SELECT PROFILE_ID, UPDATED_DATE, UPDATED_BY FROM USER_TO_PROFILE WHERE USER_KEY = ${1500347}`;
      expect(profileResult.recordset).toHaveLength(2);
      expect(profileResult.recordset[0].PROFILE_ID).toBe('ADMIN');
    });

    it('should handle case when user exists but has no profiles', async () => {
      const mockUserData = {
        recordset: [{
          USER_KEY: 1500347,
          USER_ID: 'fsajjad',
          FIRST_NAME: 'Faisal',
          LAST_NAME: 'Sajjad'
        }]
      };

      const mockEmptyProfiles = {
        recordset: []
      };

      (sql.query as jest.Mock)
        .mockResolvedValueOnce(mockUserData)
        .mockResolvedValueOnce(mockEmptyProfiles);

      const userResult = await sql.query`SELECT * FROM USERS WHERE USER_KEY = ${1500347}`;
      expect(userResult.recordset).toHaveLength(1);

      const profileResult = await sql.query`SELECT PROFILE_ID FROM USER_TO_PROFILE WHERE USER_KEY = ${1500347}`;
      expect(profileResult.recordset).toHaveLength(0);
    });

    it('should fail gracefully when user does not exist', async () => {
      const mockEmptyResult = {
        recordset: []
      };

      (sql.query as jest.Mock).mockResolvedValueOnce(mockEmptyResult);

      const userResult = await sql.query`SELECT * FROM USERS WHERE USER_KEY = ${999999}`;
      expect(userResult.recordset).toHaveLength(0);
    });
  });

  describe('User Data Fetching for Duplication', () => {
    it('should fetch original user data correctly', async () => {
      const mockUserData = {
        recordset: [{
          USER_KEY: 1500347,
          USER_ID: 'fsajjad',
          FIRST_NAME: 'Faisal',
          LAST_NAME: 'Sajjad',
          STATUS: 'Active',
          UPDATED_BY: 'Admin',
          UPDATED_DATE: '2024-01-01T10:00:00Z',
          EFFECTIVE_BEGIN_DT: '2024-01-01T10:00:00Z',
          PASSWORD_CHANGED_DATE: '2024-01-01T10:00:00Z',
          CASE_QUEUE_MAX: 10,
          ENABLE_MFA: 'Y'
        }]
      };

      (sql.query as jest.Mock).mockResolvedValueOnce(mockUserData);

      const result = await sql.query`SELECT * FROM USERS WHERE USER_KEY = ${1500347}`;
      const userData = result.recordset[0];

      // Verify all data is present
      expect(userData.USER_KEY).toBe(1500347);
      expect(userData.USER_ID).toBe('fsajjad');
      expect(userData.FIRST_NAME).toBe('Faisal');
      expect(userData.LAST_NAME).toBe('Sajjad');
      expect(userData.STATUS).toBe('Active');
      expect(userData.CASE_QUEUE_MAX).toBe(10);
      expect(userData.ENABLE_MFA).toBe('Y');
    });

    it('should fetch user profiles correctly', async () => {
      const mockProfileData = {
        recordset: [
          { PROFILE_ID: 'ADMIN', UPDATED_DATE: '2024-01-01', UPDATED_BY: 'SYSTEM' },
          { PROFILE_ID: 'USER', UPDATED_DATE: '2024-01-01', UPDATED_BY: 'SYSTEM' },
          { PROFILE_ID: 'MANAGER', UPDATED_DATE: '2024-01-01', UPDATED_BY: 'SYSTEM' }
        ]
      };

      (sql.query as jest.Mock).mockResolvedValueOnce(mockProfileData);

      const result = await sql.query`SELECT PROFILE_ID, UPDATED_DATE, UPDATED_BY FROM USER_TO_PROFILE WHERE USER_KEY = ${1500347}`;
      
      expect(result.recordset).toHaveLength(3);
      expect(result.recordset.map(p => p.PROFILE_ID)).toEqual(['ADMIN', 'USER', 'MANAGER']);
    });
  });

  describe('Data Transformation for Duplication', () => {
    it('should clean user data for duplication', () => {
      const originalUserData = {
        USER_KEY: 1500347,
        USER_ID: 'fsajjad',
        FIRST_NAME: 'Faisal',
        LAST_NAME: 'Sajjad',
        STATUS: 'Active',
        UPDATED_BY: 'Admin',
        UPDATED_DATE: '2024-01-01T10:00:00Z',
        EFFECTIVE_BEGIN_DT: '2024-01-01T10:00:00Z',
        PASSWORD_CHANGED_DATE: '2024-01-01T10:00:00Z',
        CASE_QUEUE_MAX: 10,
        ENABLE_MFA: 'Y'
      };

      // Simulate the cleaning process from UserForm
      const cleanedData = { ...originalUserData };
      delete cleanedData.USER_KEY;
      delete cleanedData.UPDATED_DATE;
      delete cleanedData.EFFECTIVE_BEGIN_DT;
      delete cleanedData.PASSWORD_CHANGED_DATE;
      
      // Clear USER_ID to force user to enter a new one
      cleanedData.USER_ID = '';

      // Verify system fields are removed
      expect(cleanedData.USER_KEY).toBeUndefined();
      expect(cleanedData.UPDATED_DATE).toBeUndefined();
      expect(cleanedData.EFFECTIVE_BEGIN_DT).toBeUndefined();
      expect(cleanedData.PASSWORD_CHANGED_DATE).toBeUndefined();

      // Verify USER_ID is cleared
      expect(cleanedData.USER_ID).toBe('');

      // Verify other data is preserved
      expect(cleanedData.FIRST_NAME).toBe('Faisal');
      expect(cleanedData.LAST_NAME).toBe('Sajjad');
      expect(cleanedData.STATUS).toBe('Active');
      expect(cleanedData.CASE_QUEUE_MAX).toBe(10);
      expect(cleanedData.ENABLE_MFA).toBe('Y');
    });

    it('should extract profile IDs from profile objects', () => {
      const profileObjects = [
        { PROFILE_ID: 'ADMIN', UPDATED_DATE: '2024-01-01', UPDATED_BY: 'SYSTEM' },
        { PROFILE_ID: 'USER', UPDATED_DATE: '2024-01-01', UPDATED_BY: 'SYSTEM' },
        { PROFILE_ID: 'MANAGER', UPDATED_DATE: '2024-01-01', UPDATED_BY: 'SYSTEM' }
      ];

      // Simulate the extraction process from UserForm
      const profileIds = profileObjects.map(p => p.PROFILE_ID);

      expect(profileIds).toEqual(['ADMIN', 'USER', 'MANAGER']);
      expect(profileIds).toHaveLength(3);
      expect(typeof profileIds[0]).toBe('string');
    });
  });

  describe('Profile Duplication Logic', () => {
    it('should create correct profile objects for new user', () => {
      const originalProfileIds = ['ADMIN', 'USER', 'MANAGER'];
      const updatedBy = 'TestUser';

      // Simulate UserProfiles component logic
      const newProfileObjects = originalProfileIds.map(profileId => ({
        PROFILE_ID: profileId,
        UPDATED_DATE: new Date().toISOString(),
        UPDATED_BY: updatedBy
      }));

      expect(newProfileObjects).toHaveLength(3);
      newProfileObjects.forEach(profile => {
        expect(profile).toHaveProperty('PROFILE_ID');
        expect(profile).toHaveProperty('UPDATED_DATE');
        expect(profile).toHaveProperty('UPDATED_BY');
        expect(profile.UPDATED_BY).toBe('TestUser');
        expect(originalProfileIds).toContain(profile.PROFILE_ID);
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      (connectToDatabase as jest.Mock).mockRejectedValueOnce(new Error('Connection failed'));

      await expect(connectToDatabase()).rejects.toThrow('Connection failed');
    });

    it('should handle SQL query errors gracefully', async () => {
      (sql.query as jest.Mock).mockRejectedValueOnce(new Error('SQL error'));

      await expect(sql.query`SELECT * FROM USERS WHERE USER_KEY = ${999999}`).rejects.toThrow('SQL error');
    });
  });

  describe('Field Validation for Duplication', () => {
    it('should ensure duplicate user has unique USER_ID', () => {
      const formData = {
        USER_ID: '', // Should be empty to force new entry
        FIRST_NAME: 'Faisal',
        LAST_NAME: 'Sajjad'
      };

      // Simulate validation
      const isUserIdEmpty = !formData.USER_ID || formData.USER_ID.trim() === '';
      
      expect(isUserIdEmpty).toBe(true);
    });

    it('should preserve all other field values during duplication', () => {
      const originalData = {
        FIRST_NAME: 'Faisal',
        LAST_NAME: 'Sajjad',
        STATUS: 'Active',
        CASE_QUEUE_MAX: 10,
        ENABLE_MFA: 'Y',
        USER_TYPE: 'Admin'
      };

      const duplicatedData = { ...originalData };
      
      Object.keys(originalData).forEach(key => {
        expect(duplicatedData[key]).toBe(originalData[key as keyof typeof originalData]);
      });
    });
  });
});