import { Slug } from './slug.vo';
import { ValueObjectValidationError } from '../errors/value-object-validation.error';
import { UUID } from './uuid.vo';

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

    it('should append last 8 characters of ID when provided', () => {
      const title = 'My Article Title';
      const id = new UUID('550e8400-e29b-41d4-a716-446655440000');
      const slug = Slug.fromTitle(title, id);
      expect(slug.getValue()).toBe('my-article-title-55440000');
    });

    it('should generate unique slugs for same title with different IDs', () => {
      const title = 'Same Title';
      const id1 = '550e8400-e29b-41d4-a716-446655440001';
      const id2 = '550e8400-e29b-41d4-a716-446655440002';
      const slug1 = Slug.fromTitle(title, new UUID(id1));
      const slug2 = Slug.fromTitle(title, new UUID(id2));
      expect(slug1.getValue()).toBe('same-title-55440001');
      expect(slug2.getValue()).toBe('same-title-55440002');
      expect(slug1.getValue()).not.toBe(slug2.getValue());
    });
  });
});
