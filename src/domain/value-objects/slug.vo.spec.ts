import { Slug } from './slug.vo';
import { ValueObjectValidationError } from '../errors/value-object-validation.error';

describe('Slug', () => {
  describe('constructor', () => {
    it('should create a valid slug', () => {
      const validSlug = 'valid-slug';
      const slug = new Slug(validSlug);
      expect(slug.getValue()).toBe(validSlug);
    });

    it('should accept slug with numbers', () => {
      const slugWithNumbers = 'slug-123-test';
      const slug = new Slug(slugWithNumbers);
      expect(slug.getValue()).toBe(slugWithNumbers);
    });

    it('should throw error when slug is empty', () => {
      const emptySlug = '';
      expect(() => new Slug(emptySlug)).toThrow(ValueObjectValidationError);
      expect(() => new Slug(emptySlug)).toThrow(
        new ValueObjectValidationError('Slug cannot be empty'),
      );
    });

    it('should throw error when slug contains uppercase letters', () => {
      const uppercaseSlug = 'Invalid-Slug';
      expect(() => new Slug(uppercaseSlug)).toThrow(
        new ValueObjectValidationError('Invalid slug format'),
      );
    });

    it('should throw error when slug contains spaces', () => {
      const slugWithSpaces = 'invalid slug';
      expect(() => new Slug(slugWithSpaces)).toThrow(
        new ValueObjectValidationError('Invalid slug format'),
      );
    });

    it('should throw error when slug contains special characters', () => {
      const slugWithSpecialChars = 'invalid@slug';
      expect(() => new Slug(slugWithSpecialChars)).toThrow(
        new ValueObjectValidationError('Invalid slug format'),
      );
    });
  });

  describe('fromTitle', () => {
    it('should generate slug from simple title', () => {
      const title = 'My Article Title';
      const slug = Slug.fromTitle(title);
      expect(slug.getValue()).toBe('my-article-title');
    });

    it('should remove accents from title', () => {
      const title = 'Título com Acentuação';
      const slug = Slug.fromTitle(title);
      expect(slug.getValue()).toBe('titulo-com-acentuacao');
    });

    it('should remove special characters', () => {
      const title = 'Title @#$% with Special!';
      const slug = Slug.fromTitle(title);
      expect(slug.getValue()).toBe('title-with-special');
    });

    it('should replace multiple spaces with single hyphen', () => {
      const title = 'Title    with    spaces';
      const slug = Slug.fromTitle(title);
      expect(slug.getValue()).toBe('title-with-spaces');
    });

    it('should remove leading and trailing hyphens', () => {
      const title = '  -Title with spaces-  ';
      const slug = Slug.fromTitle(title);
      expect(slug.getValue()).toBe('title-with-spaces');
      expect(slug.getValue().startsWith('-')).toBe(false);
      expect(slug.getValue().endsWith('-')).toBe(false);
    });

    it('should handle title with numbers', () => {
      const title = 'Article 123 About Testing';
      const slug = Slug.fromTitle(title);
      expect(slug.getValue()).toBe('article-123-about-testing');
    });

    it('should convert to lowercase', () => {
      const title = 'UPPERCASE TITLE';
      const slug = Slug.fromTitle(title);
      expect(slug.getValue()).toBe('uppercase-title');
    });

    it('should handle mixed case with accents', () => {
      const title = 'Criação de APIs RESTful';
      const slug = Slug.fromTitle(title);
      expect(slug.getValue()).toBe('criacao-de-apis-restful');
    });

    it('should remove duplicate hyphens', () => {
      const title = 'Title -- with -- dashes';
      const slug = Slug.fromTitle(title);
      expect(slug.getValue()).toBe('title-with-dashes');
    });

    it('should handle Portuguese characters', () => {
      const title = 'Programação em TypeScript';
      const slug = Slug.fromTitle(title);
      expect(slug.getValue()).toBe('programacao-em-typescript');
    });
  });
});
