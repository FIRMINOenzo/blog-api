import { Test, TestingModule } from '@nestjs/testing';
import { GetArticleByIdUseCase } from './get-article-by-id.usecase';
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

describe('GetArticleByIdUseCase', () => {
  let useCase: GetArticleByIdUseCase;
  let articleRepository: jest.Mocked<ArticleRepository>;

  const READER_ROLE = new RoleEntity(
    '550e8400-e29b-41d4-a716-446655440000',
    'READER',
    [new Permission(PermissionAction.READ, PermissionSubject.ARTICLE)],
  );

  const READER_ACCOUNT = new AccountEntity(
    '550e8400-e29b-41d4-a716-446655440001',
    'Reader User',
    'reader@example.com',
    'hashed-password',
    new Date('2024-01-01'),
    new Date('2024-01-01'),
    READER_ROLE,
  );

  const AUTHOR_ACCOUNT = new AccountEntity(
    '550e8400-e29b-41d4-a716-446655440002',
    'Author User',
    'author@example.com',
    'hashed-password',
    new Date('2024-01-01'),
    new Date('2024-01-01'),
    READER_ROLE,
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

  beforeEach(async () => {
    const mockArticleRepository: Partial<ArticleRepository> = {
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetArticleByIdUseCase,
        {
          provide: 'ArticleRepository',
          useValue: mockArticleRepository,
        },
      ],
    }).compile();

    useCase = module.get<GetArticleByIdUseCase>(GetArticleByIdUseCase);
    articleRepository = module.get('ArticleRepository');
  });

  describe('execute', () => {
    it('should return article when id exists and user has READ:ARTICLE permission', async () => {
      const articleId = '550e8400-e29b-41d4-a716-446655440010';
      const article = new ArticleEntity(
        articleId,
        'Test Article',
        'a'.repeat(100),
        new Date('2024-01-01'),
        new Date('2024-01-01'),
        AUTHOR_ACCOUNT,
      );

      articleRepository.findById.mockResolvedValue(article);

      const result = await useCase.execute(READER_ACCOUNT, articleId);

      expect(result.id).toBe(article.getId());
      expect(result.title).toBe(article.getTitle());
      expect(result.content).toBe(article.getContent());
      expect(result.slug).toBe(article.getSlug());
      expect(result.author.id).toBe(AUTHOR_ACCOUNT.getId());
      expect(articleRepository.findById).toHaveBeenCalledWith(
        new UUID(articleId),
      );
      expect(articleRepository.findById).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundError when article does not exist', async () => {
      const nonExistentId = '550e8400-e29b-41d4-a716-446655440999';
      articleRepository.findById.mockResolvedValue(null);

      await expect(
        useCase.execute(READER_ACCOUNT, nonExistentId),
      ).rejects.toThrow(
        new NotFoundError(`Article with id '${nonExistentId}' not found`),
      );

      expect(articleRepository.findById).toHaveBeenCalledWith(
        new UUID(nonExistentId),
      );
    });

    it('should throw ForbiddenError when user does not have READ:ARTICLE permission', async () => {
      const articleId = '550e8400-e29b-41d4-a716-446655440010';

      await expect(
        useCase.execute(NO_PERMISSION_ACCOUNT, articleId),
      ).rejects.toThrow(
        new ForbiddenError('You are not allowed to read articles'),
      );

      expect(articleRepository.findById).not.toHaveBeenCalled();
    });

    it('should return complete article information', async () => {
      const articleId = '550e8400-e29b-41d4-a716-446655440010';
      const article = new ArticleEntity(
        articleId,
        'Complete Article',
        'b'.repeat(100),
        new Date('2024-01-01'),
        new Date('2024-01-02'),
        AUTHOR_ACCOUNT,
      );

      articleRepository.findById.mockResolvedValue(article);

      const result = await useCase.execute(READER_ACCOUNT, articleId);

      expect(result).toEqual({
        id: article.getId(),
        title: article.getTitle(),
        content: article.getContent(),
        slug: article.getSlug(),
        author: {
          id: AUTHOR_ACCOUNT.getId(),
          name: AUTHOR_ACCOUNT.getName(),
          email: AUTHOR_ACCOUNT.getEmail(),
        },
        createdAt: article.getCreatedAt(),
        updatedAt: article.getUpdatedAt(),
      });
    });
  });
});
