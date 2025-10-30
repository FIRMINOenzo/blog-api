import { ArticleEntity } from './article.entity';
import { AccountEntity } from './account.entity';
import { RoleEntity } from './role.entity';
import {
  Permission,
  PermissionAction,
  PermissionSubject,
} from '../value-objects';
import { ForbiddenError } from '../errors/forbidden.error';
import { ValueObjectValidationError } from '../errors/value-object-validation.error';

describe('ArticleEntity', () => {
  const EDITOR_ROLE = new RoleEntity(
    '550e8400-e29b-41d4-a716-446655440000',
    'EDITOR',
    [
      new Permission(PermissionAction.CREATE, PermissionSubject.ARTICLE),
      new Permission(PermissionAction.UPDATE, PermissionSubject.ARTICLE),
      new Permission(PermissionAction.DELETE, PermissionSubject.ARTICLE),
    ],
  );
  const READER_ROLE = new RoleEntity(
    '550e8400-e29b-41d4-a716-446655440001',
    'READER',
    [new Permission(PermissionAction.READ, PermissionSubject.ARTICLE)],
  );
  const EDITOR_ACCOUNT = new AccountEntity(
    '550e8400-e29b-41d4-a716-446655440002',
    'Editor User',
    'editor@example.com',
    'hashed-password',
    new Date('2024-01-01'),
    new Date('2024-01-01'),
    EDITOR_ROLE,
  );
  const READER_ACCOUNT = new AccountEntity(
    '550e8400-e29b-41d4-a716-446655440003',
    'Reader User',
    'reader@example.com',
    'hashed-password',
    new Date('2024-01-01'),
    new Date('2024-01-01'),
    READER_ROLE,
  );
  const VALID_TITLE = 'My Article Title';
  const VALID_CONTENT = 'a'.repeat(100);

  describe('create', () => {
    it('should create article with valid data', () => {
      const article = ArticleEntity.create(
        EDITOR_ACCOUNT,
        VALID_TITLE,
        VALID_CONTENT,
      );
      expect(article.getId()).toBeDefined();
      expect(article.getTitle()).toBe(VALID_TITLE);
      expect(article.getContent()).toBe(VALID_CONTENT);
      expect(article.getSlug()).toBe('my-article-title');
      expect(article.getCreatedAt()).toBeInstanceOf(Date);
      expect(article.getUpdatedAt()).toBeInstanceOf(Date);
      expect(article.getAuthor()).toBe(EDITOR_ACCOUNT);
    });

    it('should generate slug from title', () => {
      const title = 'Criação de APIs RESTful';
      const article = ArticleEntity.create(
        EDITOR_ACCOUNT,
        title,
        VALID_CONTENT,
      );
      expect(article.getSlug()).toBe('criacao-de-apis-restful');
    });

    it('should set createdAt and updatedAt to same value', () => {
      const article = ArticleEntity.create(
        EDITOR_ACCOUNT,
        VALID_TITLE,
        VALID_CONTENT,
      );
      expect(article.getCreatedAt().getTime()).toBe(
        article.getUpdatedAt().getTime(),
      );
    });

    it('should throw ForbiddenError when user lacks CREATE:ARTICLE permission', () => {
      expect(() =>
        ArticleEntity.create(READER_ACCOUNT, VALID_TITLE, VALID_CONTENT),
      ).toThrow(new ForbiddenError('You are not allowed to create articles'));
    });

    it('should throw error when title is invalid', () => {
      const invalidTitle = 'abc';
      expect(() =>
        ArticleEntity.create(EDITOR_ACCOUNT, invalidTitle, VALID_CONTENT),
      ).toThrow(ValueObjectValidationError);
    });

    it('should throw error when content is invalid', () => {
      const invalidContent = 'Short';
      expect(() =>
        ArticleEntity.create(EDITOR_ACCOUNT, VALID_TITLE, invalidContent),
      ).toThrow(ValueObjectValidationError);
    });
  });

  describe('update', () => {
    it('should update article title and content', () => {
      const article = ArticleEntity.create(
        EDITOR_ACCOUNT,
        VALID_TITLE,
        VALID_CONTENT,
      );
      const newTitle = 'Updated Title';
      const newContent = 'b'.repeat(100);
      const originalUpdatedAt = article.getUpdatedAt();

      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      article.update(EDITOR_ACCOUNT, newTitle, newContent);
      expect(article.getTitle()).toBe(newTitle);
      expect(article.getContent()).toBe(newContent);
      expect(article.getUpdatedAt().getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );

      jest.useRealTimers();
    });

    it('should update slug when updating title', () => {
      const article = ArticleEntity.create(
        EDITOR_ACCOUNT,
        VALID_TITLE,
        VALID_CONTENT,
      );
      const originalSlug = article.getSlug();
      article.update(EDITOR_ACCOUNT, 'New Title', VALID_CONTENT);
      expect(article.getSlug()).not.toBe(originalSlug);
      expect(article.getSlug()).toBe('new-title');
    });

    it('should throw ForbiddenError when user lacks UPDATE:ARTICLE permission', () => {
      const article = ArticleEntity.create(
        EDITOR_ACCOUNT,
        VALID_TITLE,
        VALID_CONTENT,
      );

      expect(() =>
        article.update(READER_ACCOUNT, 'New Title', VALID_CONTENT),
      ).toThrow(ForbiddenError);

      expect(() =>
        article.update(READER_ACCOUNT, 'New Title', VALID_CONTENT),
      ).toThrow('You are not allowed to update articles');
    });

    it('should throw error when new title is invalid', () => {
      const article = ArticleEntity.create(
        EDITOR_ACCOUNT,
        VALID_TITLE,
        VALID_CONTENT,
      );
      const invalidTitle = 'abc';
      expect(() =>
        article.update(EDITOR_ACCOUNT, invalidTitle, VALID_CONTENT),
      ).toThrow(ValueObjectValidationError);
    });

    it('should throw error when new content is invalid', () => {
      const article = ArticleEntity.create(
        EDITOR_ACCOUNT,
        VALID_TITLE,
        VALID_CONTENT,
      );
      const invalidContent = 'Short';
      expect(() =>
        article.update(EDITOR_ACCOUNT, VALID_TITLE, invalidContent),
      ).toThrow(ValueObjectValidationError);
    });

    it('should update updatedAt timestamp', () => {
      const article = ArticleEntity.create(
        EDITOR_ACCOUNT,
        VALID_TITLE,
        VALID_CONTENT,
      );
      const originalUpdatedAt = article.getUpdatedAt();

      jest.useFakeTimers();
      jest.advanceTimersByTime(1000);

      article.update(EDITOR_ACCOUNT, 'New Title', VALID_CONTENT);
      expect(article.getUpdatedAt().getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );
      jest.useRealTimers();
    });

    it('should not change author when updating', () => {
      const article = ArticleEntity.create(
        EDITOR_ACCOUNT,
        VALID_TITLE,
        VALID_CONTENT,
      );
      article.update(EDITOR_ACCOUNT, 'New Title', VALID_CONTENT);
      expect(article.getAuthor()).toBe(EDITOR_ACCOUNT);
    });
  });
});
