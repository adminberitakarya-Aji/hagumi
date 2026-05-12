import { validatePetName, validateUserID, validateStats } from '@/lib/validation';

describe('Validation Utilities', () => {
  describe('validatePetName', () => {
    it('should accept valid pet names', () => {
      expect(validatePetName('Sakura')).toBe(true);
      expect(validatePetName('Fluffy')).toBe(true);
      expect(validatePetName('Max')).toBe(true);
      expect(validatePetName('Bella 123')).toBe(true);
    });

    it('should reject empty names', () => {
      expect(validatePetName('')).toBe(false);
      expect(validatePetName('   ')).toBe(false);
    });

    it('should reject names that are too long', () => {
      const longName = 'A'.repeat(51);
      expect(validatePetName(longName)).toBe(false);
    });

    it('should reject names with special characters', () => {
      expect(validatePetName('Pet@Name')).toBe(false);
      expect(validatePetName('Pet#Name')).toBe(false);
      expect(validatePetName('Pet$Name')).toBe(false);
    });

    it('should accept names with spaces', () => {
      expect(validatePetName('My Pet')).toBe(true);
      expect(validatePetName('Pet Name')).toBe(true);
    });
  });

  describe('validateUserID', () => {
    it('should accept valid UUIDs', () => {
      expect(validateUserID('550e8400-e29b-41d4-a716-446655440000')).toBe(true);
      expect(validateUserID('6ba7b810-9dad-11d1-80b4-00c04fd430c8')).toBe(true);
    });

    it('should reject invalid UUIDs', () => {
      expect(validateUserID('not-a-uuid')).toBe(false);
      expect(validateUserID('12345')).toBe(false);
      expect(validateUserID('')).toBe(false);
    });

    it('should reject malformed UUIDs', () => {
      expect(validateUserID('550e8400-e29b-41d4-a716')).toBe(false);
      expect(validateUserID('550e8400-e29b-41d4-a716-446655440000-extra')).toBe(false);
    });
  });

  describe('validateStats', () => {
    it('should accept valid stats', () => {
      expect(validateStats(50, 50, 50, 50)).toBe(true);
      expect(validateStats(100, 100, 100, 100)).toBe(true);
      expect(validateStats(0, 0, 0, 0)).toBe(true);
    });

    it('should reject stats below minimum', () => {
      expect(validateStats(-1, 50, 50, 50)).toBe(false);
      expect(validateStats(50, -1, 50, 50)).toBe(false);
      expect(validateStats(50, 50, -1, 50)).toBe(false);
      expect(validateStats(50, 50, 50, -1)).toBe(false);
    });

    it('should reject stats above maximum', () => {
      expect(validateStats(101, 50, 50, 50)).toBe(false);
      expect(validateStats(50, 101, 50, 50)).toBe(false);
      expect(validateStats(50, 50, 101, 50)).toBe(false);
      expect(validateStats(50, 50, 50, 101)).toBe(false);
    });

    it('should accept boundary values', () => {
      expect(validateStats(0, 0, 0, 0)).toBe(true);
      expect(validateStats(100, 100, 100, 100)).toBe(true);
    });
  });
});