import { Test, TestingModule } from '@nestjs/testing';
import { UpdateArticleUseCase } from './update-article.usecase';
import { ArticleRepository } from 'src/domain/repositories/article.repository';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { RoleEntity } from 'src/domain/entities/role.entity';
import { ArticleEntity } from 'src/domain/entities/article.entity';
import {
  Permission,
  PermissionAction,
  PermissionSubject,
  UUID,
} from 'src/domain/value-objects';
import { ForbiddenError } from 'src/domain/errors/forbidden.error';
import { NotFoundError } from 'src/domain/errors/not-found.error';

describe('UpdateArticleUseCase', () => {
  let useCase: UpdateArticleUseCase;
  let articleRepository: jest.Mocked<ArticleRepository>;

  const EDITOR_ROLE = new RoleEntity(
    '550e8400-e29b-41d4-a716-446655440000',
    'EDITOR',
    [new Permission(PermissionAction.UPDATE, PermissionSubject.ARTICLE)],
  );

  const OTHER_EDITOR_ROLE = new RoleEntity(
    '550e8400-e29b-41d4-a716-446655440003',
    'EDITOR',
    [new Permission(PermissionAction.UPDATE, PermissionSubject.ARTICLE)],
  );

  const AUTHOR_ACCOUNT = new AccountEntity(
    '550e8400-e29b-41d4-a716-446655440001',
    'Author User',
    'author@example.com',
    'hashed-password',
    new Date('2024-01-01'),
    new Date('2024-01-01'),
    EDITOR_ROLE,
  );

  const OTHER_EDITOR_ACCOUNT = new AccountEntity(
    '550e8400-e29b-41d4-a716-446655440002',
    'Other Editor',
    'other@example.com',
    'hashed-password',
    new Date('2024-01-01'),
    new Date('2024-01-01'),
    OTHER_EDITOR_ROLE,
  );

  const NO_PERMISSION_ROLE = new RoleEntity(
    '550e8400-e29b-41d4-a716-446655440099',
    'NO_PERMISSION',
    [],
  );

  const NO_PERMISSION_ACCOUNT = new AccountEntity(
    '550e8400-e29b-41d4-a716-446655440098',
    'No Permission User',
    'noperm@example.com',
    'hashed-password',
    new Date('2024-01-01'),
    new Date('2024-01-01'),
    NO_PERMISSION_ROLE,
  );

  const ARTICLE_ID = '550e8400-e29b-41d4-a716-446655440010';

  beforeEach(async () => {
    const mockArticleRepository: Partial<ArticleRepository> = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateArticleUseCase,
        {
          provide: 'ArticleRepository',
          useValue: mockArticleRepository,
        },
      ],
    }).compile();

    useCase = module.get<UpdateArticleUseCase>(UpdateArticleUseCase);
    articleRepository = module.get('ArticleRepository');
  });

  describe('execute', () => {
    it('should update article title when user is the author', async () => {
      const article = new ArticleEntity(
        ARTICLE_ID,
        'Old Title',
        'a'.repeat(100),
        new Date('2024-01-01'),
        new Date('2024-01-01'),
        AUTHOR_ACCOUNT,
      );

      articleRepository.findById.mockResolvedValue(article);
      articleRepository.update.mockResolvedValue();

      const result = await useCase.execute(AUTHOR_ACCOUNT, ARTICLE_ID, {
        title: 'New Title',
      });

      expect(result.title).toBe('New Title');
      expect(result.slug).toMatch(/^new-title-/);
      expect(articleRepository.findById).toHaveBeenCalledWith(
        new UUID(ARTICLE_ID),
      );
      expect(articleRepository.update).toHaveBeenCalledWith(article);
    });

    it('should update article content when user is the author', async () => {
      const article = new ArticleEntity(
        ARTICLE_ID,
        'Test Title',
        'a'.repeat(100),
        new Date('2024-01-01'),
        new Date('2024-01-01'),
        AUTHOR_ACCOUNT,
      );

      articleRepository.findById.mockResolvedValue(article);
      articleRepository.update.mockResolvedValue();

      const newContent = 'b'.repeat(100);
      const result = await useCase.execute(AUTHOR_ACCOUNT, ARTICLE_ID, {
        content: newContent,
      });

      expect(result.content).toBe(newContent);
      expect(articleRepository.update).toHaveBeenCalledWith(article);
    });

    it('should update both title and content when both are provided', async () => {
      const article = new ArticleEntity(
        ARTICLE_ID,
        'Old Title',
        'a'.repeat(100),
        new Date('2024-01-01'),
        new Date('2024-01-01'),
        AUTHOR_ACCOUNT,
      );

      articleRepository.findById.mockResolvedValue(article);
      articleRepository.update.mockResolvedValue();

      const newContent = 'b'.repeat(100);
      const result = await useCase.execute(AUTHOR_ACCOUNT, ARTICLE_ID, {
        title: 'New Title',
        content: newContent,
      });

      expect(result.title).toBe('New Title');
      expect(result.content).toBe(newContent);
      expect(result.slug).toMatch(/^new-title-/);
      expect(articleRepository.update).toHaveBeenCalledWith(article);
    });

    it('should throw NotFoundError when article does not exist', async () => {
      articleRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute(AUTHOR_ACCOUNT, ARTICLE_ID, { title: 'New Title' }),
      ).rejects.toThrow(
        new NotFoundError(`Article with id '${ARTICLE_ID}' not found`),
      );

      expect(articleRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when user does not have UPDATE:ARTICLE permission', async () => {
      const article = new ArticleEntity(
        ARTICLE_ID,
        'Test Title',
        'a'.repeat(100),
        new Date('2024-01-01'),
        new Date('2024-01-01'),
        AUTHOR_ACCOUNT,
      );

      articleRepository.findById.mockResolvedValue(article);

      await expect(
        useCase.execute(NO_PERMISSION_ACCOUNT, ARTICLE_ID, {
          title: 'New Title',
        }),
      ).rejects.toThrow(
        new ForbiddenError('You are not allowed to update articles'),
      );

      expect(articleRepository.update).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when user is not the article author', async () => {
      const authorRole = new RoleEntity(
        '550e8400-e29b-41d4-a716-446655440010',
        'EDITOR',
        [new Permission(PermissionAction.UPDATE, PermissionSubject.ARTICLE)],
      );

      const articleAuthor = new AccountEntity(
        '550e8400-e29b-41d4-a716-446655440011',
        'Article Author',
        'author@test.com',
        'hashed-password',
        new Date('2024-01-01'),
        new Date('2024-01-01'),
        authorRole,
      );

      const article = new ArticleEntity(
        ARTICLE_ID,
        'Test Title',
        'a'.repeat(100),
        new Date('2024-01-01'),
        new Date('2024-01-01'),
        articleAuthor,
      );

      articleRepository.findById.mockResolvedValue(article);

      await expect(
        useCase.execute(OTHER_EDITOR_ACCOUNT, ARTICLE_ID, {
          title: 'New Title',
        }),
      ).rejects.toThrow(
        new ForbiddenError('You can only update your own articles'),
      );

      expect(articleRepository.update).not.toHaveBeenCalled();
    });

    it('should update the updatedAt timestamp', async () => {
      const originalDate = new Date('2024-01-01');
      const article = new ArticleEntity(
        ARTICLE_ID,
        'Test Title',
        'a'.repeat(100),
        originalDate,
        originalDate,
        AUTHOR_ACCOUNT,
      );

      articleRepository.findById.mockResolvedValue(article);
      articleRepository.update.mockResolvedValue();

      const result = await useCase.execute(AUTHOR_ACCOUNT, ARTICLE_ID, {
        title: 'New Title',
      });

      expect(result.updatedAt.getTime()).toBeGreaterThan(
        originalDate.getTime(),
      );
    });
  });
});
