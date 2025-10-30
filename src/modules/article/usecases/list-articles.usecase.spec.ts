import { Test, TestingModule } from '@nestjs/testing';
import { ListArticlesUseCase } from './list-articles.usecase';
import { ArticleRepository } from 'src/domain/repositories/article.repository';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { RoleEntity } from 'src/domain/entities/role.entity';
import { ArticleEntity } from 'src/domain/entities/article.entity';
import {
  Permission,
  PermissionAction,
  PermissionSubject,
} from 'src/domain/value-objects';
import { ForbiddenError } from 'src/domain/errors/forbidden.error';

describe('ListArticlesUseCase', () => {
  let useCase: ListArticlesUseCase;
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
      findAll: jest.fn(),
      findAllPaginated: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ListArticlesUseCase,
        {
          provide: 'ArticleRepository',
          useValue: mockArticleRepository,
        },
      ],
    }).compile();

    useCase = module.get<ListArticlesUseCase>(ListArticlesUseCase);
    articleRepository = module.get('ArticleRepository');
  });

  describe('execute', () => {
    it('should return paginated list of articles with default pagination', async () => {
      const article1 = new ArticleEntity(
        '550e8400-e29b-41d4-a716-446655440010',
        'First Article',
        'a'.repeat(100),
        new Date('2024-01-01'),
        new Date('2024-01-01'),
        AUTHOR_ACCOUNT,
      );

      const article2 = new ArticleEntity(
        '550e8400-e29b-41d4-a716-446655440011',
        'Second Article',
        'b'.repeat(100),
        new Date('2024-01-02'),
        new Date('2024-01-02'),
        AUTHOR_ACCOUNT,
      );

      articleRepository.findAllPaginated.mockResolvedValue({
        articles: [article1, article2],
        total: 2,
      });

      const result = await useCase.execute(READER_ACCOUNT);

      expect(result.data).toHaveLength(2);
      expect(result.meta).toEqual({
        page: 1,
        limit: 10,
        total: 2,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      });
      expect(articleRepository.findAllPaginated).toHaveBeenCalledWith(0, 10);
    });

    it('should return paginated list with custom page and limit', async () => {
      const article1 = new ArticleEntity(
        '550e8400-e29b-41d4-a716-446655440010',
        'First Article',
        'a'.repeat(100),
        new Date('2024-01-01'),
        new Date('2024-01-01'),
        AUTHOR_ACCOUNT,
      );

      articleRepository.findAllPaginated.mockResolvedValue({
        articles: [article1],
        total: 5,
      });

      const result = await useCase.execute(READER_ACCOUNT, {
        page: 2,
        limit: 1,
      });

      expect(result.data).toHaveLength(1);
      expect(result.meta).toEqual({
        page: 2,
        limit: 1,
        total: 5,
        totalPages: 5,
        hasNextPage: true,
        hasPreviousPage: true,
      });
      expect(articleRepository.findAllPaginated).toHaveBeenCalledWith(1, 1);
    });

    it('should return list of articles when user has READ:ARTICLE permission', async () => {
      const article1 = new ArticleEntity(
        '550e8400-e29b-41d4-a716-446655440010',
        'First Article',
        'a'.repeat(100),
        new Date('2024-01-01'),
        new Date('2024-01-01'),
        AUTHOR_ACCOUNT,
      );

      const article2 = new ArticleEntity(
        '550e8400-e29b-41d4-a716-446655440011',
        'Second Article',
        'b'.repeat(100),
        new Date('2024-01-02'),
        new Date('2024-01-02'),
        AUTHOR_ACCOUNT,
      );

      articleRepository.findAllPaginated.mockResolvedValue({
        articles: [article1, article2],
        total: 2,
      });

      const result = await useCase.execute(READER_ACCOUNT);

      expect(result.data).toHaveLength(2);
      expect(result.data[0].id).toBe(article1.getId());
      expect(result.data[1].id).toBe(article2.getId());
    });

    it('should return empty list when no articles exist', async () => {
      articleRepository.findAllPaginated.mockResolvedValue({
        articles: [],
        total: 0,
      });

      const result = await useCase.execute(READER_ACCOUNT);

      expect(result.data).toHaveLength(0);
      expect(result.meta.total).toBe(0);
    });

    it('should throw ForbiddenError when user does not have READ:ARTICLE permission', async () => {
      await expect(useCase.execute(NO_PERMISSION_ACCOUNT)).rejects.toThrow(
        new ForbiddenError('You are not allowed to read articles'),
      );

      expect(articleRepository.findAllPaginated).not.toHaveBeenCalled();
    });

    it('should include article author information in response', async () => {
      const article = new ArticleEntity(
        '550e8400-e29b-41d4-a716-446655440010',
        'Article With Author',
        'c'.repeat(100),
        new Date('2024-01-01'),
        new Date('2024-01-01'),
        AUTHOR_ACCOUNT,
      );

      articleRepository.findAllPaginated.mockResolvedValue({
        articles: [article],
        total: 1,
      });

      const result = await useCase.execute(READER_ACCOUNT);

      expect(result.data[0].author).toEqual({
        id: AUTHOR_ACCOUNT.getId(),
        name: AUTHOR_ACCOUNT.getName(),
        email: AUTHOR_ACCOUNT.getEmail(),
      });
    });
  });
});
