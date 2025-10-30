import { Content } from './content.vo';
import { ValueObjectValidationError } from '../errors/value-object-validation.error';

describe('Content', () => {
  it('should create valid content', () => {
    const validContent = 'a'.repeat(100);
    const content = new Content(validContent);
    expect(content.getValue()).toBe(validContent);
  });

  it('should create content with minimum length', () => {
    const minContent = 'a'.repeat(100);
    const content = new Content(minContent);
    expect(content.getValue()).toBe(minContent);
    expect(content.getValue().length).toBe(100);
  });

  it('should create content with maximum length', () => {
    const maxContent = 'a'.repeat(50000);
    const content = new Content(maxContent);
    expect(content.getValue()).toBe(maxContent);
    expect(content.getValue().length).toBe(50000);
  });

  it('should accept content with multiple paragraphs', () => {
    const multiParagraphContent =
      'Paragraph 1\n\nParagraph 2\n\nParagraph 3' + 'a'.repeat(80);
    const content = new Content(multiParagraphContent);
    expect(content.getValue()).toBe(multiParagraphContent);
  });

  it('should throw error when content is empty', () => {
    const emptyContent = '';
    expect(() => new Content(emptyContent)).toThrow(ValueObjectValidationError);
    expect(() => new Content(emptyContent)).toThrow('Content cannot be empty');
  });

  it('should throw error when content is only whitespace', () => {
    const whitespaceContent = '   ';
    expect(() => new Content(whitespaceContent)).toThrow(
      ValueObjectValidationError,
    );
    expect(() => new Content(whitespaceContent)).toThrow(
      'Content cannot be empty',
    );
  });

  it('should throw error when content is too short', () => {
    const shortContent = 'Short content here';
    expect(() => new Content(shortContent)).toThrow(ValueObjectValidationError);
    expect(() => new Content(shortContent)).toThrow(
      'Content must be at least 100 characters long',
    );
  });

  it('should throw error when content is too long', () => {
    const longContent = 'a'.repeat(50001);
    expect(() => new Content(longContent)).toThrow(ValueObjectValidationError);
    expect(() => new Content(longContent)).toThrow(
      'Content must be at most 50000 characters long',
    );
  });

  it('should accept content with special characters', () => {
    const contentWithSpecialChars =
      'Content with special chars: @#$%^&*()' + 'a'.repeat(70);
    const content = new Content(contentWithSpecialChars);
    expect(content.getValue()).toBe(contentWithSpecialChars);
  });

  it('should accept content with HTML tags', () => {
    const contentWithHTML =
      '<p>This is a paragraph</p><strong>Bold text</strong>' + 'a'.repeat(50);
    const content = new Content(contentWithHTML);
    expect(content.getValue()).toBe(contentWithHTML);
  });

  it('should accept content with markdown', () => {
    const contentWithMarkdown =
      '# Heading\n\n**Bold** and *italic* text' + 'a'.repeat(70);
    const content = new Content(contentWithMarkdown);
    expect(content.getValue()).toBe(contentWithMarkdown);
  });
});
