import { validatePetName, validateUserID, validateStats } from '@/lib/validation';

describe('Validation Utilities', () => {
  describe('validatePetName', () => {
    it('should accept valid pet names', () => {
      expect(validatePetName('Sakura').valid).toBe(true);
      expect(validatePetName('Fluffy').valid).toBe(true);
      expect(validatePetName('Max').valid).toBe(true);
      expect(validatePetName('Bella 123').valid).toBe(true);
    });

    it('should reject empty names', () => {
      expect(validatePetName('').valid).toBe(false);
      expect(validatePetName('   ').valid).toBe(false);
    });

    it('should reject names that are too long', () => {
      const longName = 'A'.repeat(51);
      expect(validatePetName(longName).valid).toBe(false);
    });

    it('should reject names with special characters', () => {
      expect(validatePetName('Pet@Name').valid).toBe(false);
      expect(validatePetName('Pet#Name').valid).toBe(false);
      expect(validatePetName('Pet$Name').valid).toBe(false);
    });

    it('should accept names with spaces', () => {
      expect(validatePetName('My Pet').valid).toBe(true);
      expect(validatePetName('Pet Name').valid).toBe(true);
    });
  });

  describe('validateUserID', () => {
    it('should accept valid UUIDs', () => {
      expect(validateUserID('550e8400-e29b-41d4-a716-446655440000').valid).toBe(true);
      expect(validateUserID('6ba7b810-9dad-11d1-80b4-00c04fd430c8').valid).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(validateUserID('not-a-uuid').valid).toBe(false);
      expect(validateUserID('12345').valid).toBe(false);
      expect(validateUserID('').valid).toBe(false);
    });

    it('should reject malformed UUIDs', () => {
      expect(validateUserID('550e8400-e29b-41d4-a716').valid).toBe(false);
      expect(validateUserID('550e8400-e29b-41d4-a716-446655440000-extra').valid).toBe(false);
    });
  });

  describe('validateStats', () => {
    it('should accept valid stats', () => {
      expect(validateStats(50, 50, 50, 50).valid).toBe(true);
      expect(validateStats(100, 100, 100, 100).valid).toBe(true);
      expect(validateStats(0, 0, 0, 0).valid).toBe(true);
    });

    it('should reject stats below minimum', () => {
      expect(validateStats(-1, 50, 50, 50).valid).toBe(false);
      expect(validateStats(50, -1, 50, 50).valid).toBe(false);
      expect(validateStats(50, 50, -1, 50).valid).toBe(false);
      expect(validateStats(50, 50, 50, -1).valid).toBe(false);
    });

    it('should reject stats above maximum', () => {
      expect(validateStats(101, 50, 50, 50).valid).toBe(false);
      expect(validateStats(50, 101, 50, 50).valid).toBe(false);
      expect(validateStats(50, 50, 101, 50).valid).toBe(false);
      expect(validateStats(50, 50, 50, 101).valid).toBe(false);
    });

    it('should accept boundary values', () => {
      expect(validateStats(0, 0, 0, 0).valid).toBe(true);
      expect(validateStats(100, 100, 100, 100).valid).toBe(true);
    });
  });
});