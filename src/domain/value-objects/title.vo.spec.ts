import { Title } from './title.vo';
import { ValueObjectValidationError } from '../errors/value-object-validation.error';

describe('Title', () => {
  describe('constructor', () => {
    it('should create a valid title', () => {
      const validTitle = 'Valid Title';
      const title = new Title(validTitle);
      expect(title.getValue()).toBe(validTitle);
    });

    it('should create title with minimum length', () => {
      const minTitle = 'Title';
      const title = new Title(minTitle);
      expect(title.getValue()).toBe(minTitle);
    });

    it('should create title with maximum length', () => {
      const maxTitle = 'a'.repeat(150);
      const title = new Title(maxTitle);
      expect(title.getValue()).toBe(maxTitle);
    });

    it('should trim whitespace from title', () => {
      const titleWithSpaces = '  Valid Title  ';
      const title = new Title(titleWithSpaces);
      expect(title.getValue()).toBe(titleWithSpaces);
    });

    it('should throw error when title is empty', () => {
      const emptyTitle = '';
      expect(() => new Title(emptyTitle)).toThrow(
        new ValueObjectValidationError('Title cannot be empty'),
      );
    });

    it('should throw error when title is only whitespace', () => {
      const whitespaceTitle = '   ';
      expect(() => new Title(whitespaceTitle)).toThrow(
        new ValueObjectValidationError('Title cannot be empty'),
      );
    });

    it('should throw error when title is too short', () => {
      const shortTitle = 'abc';
      expect(() => new Title(shortTitle)).toThrow(
        new ValueObjectValidationError(
          'Title must be at least 5 characters long',
        ),
      );
    });

    it('should throw error when title is too long', () => {
      const longTitle = 'a'.repeat(151);
      expect(() => new Title(longTitle)).toThrow(
        new ValueObjectValidationError(
          'Title must be at most 150 characters long',
        ),
      );
    });

    it('should accept title with special characters', () => {
      const titleWithSpecialChars = 'Title: With Special @#$%';
      const title = new Title(titleWithSpecialChars);
      expect(title.getValue()).toBe(titleWithSpecialChars);
    });

    it('should accept title with numbers', () => {
      const titleWithNumbers = 'Title 123 Test';
      const title = new Title(titleWithNumbers);
      expect(title.getValue()).toBe(titleWithNumbers);
    });
  });
});
