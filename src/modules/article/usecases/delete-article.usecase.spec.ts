import { Test, TestingModule } from '@nestjs/testing';
import { DeleteArticleUseCase } from './delete-article.usecase';
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

describe('DeleteArticleUseCase', () => {
  let useCase: DeleteArticleUseCase;
  let articleRepository: jest.Mocked<ArticleRepository>;

  const EDITOR_ROLE = new RoleEntity(
    '550e8400-e29b-41d4-a716-446655440000',
    'EDITOR',
    [new Permission(PermissionAction.DELETE, PermissionSubject.ARTICLE)],
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
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DeleteArticleUseCase,
        {
          provide: 'ArticleRepository',
          useValue: mockArticleRepository,
        },
      ],
    }).compile();

    useCase = module.get<DeleteArticleUseCase>(DeleteArticleUseCase);
    articleRepository = module.get('ArticleRepository');
  });

  describe('execute', () => {
    it('should delete article when user is the author', async () => {
      const article = new ArticleEntity(
        ARTICLE_ID,
        'Test Article',
        'a'.repeat(100),
        new Date('2024-01-01'),
        new Date('2024-01-01'),
        AUTHOR_ACCOUNT,
      );

      articleRepository.findById.mockResolvedValue(article);
      articleRepository.delete.mockResolvedValue();

      await useCase.execute(AUTHOR_ACCOUNT, ARTICLE_ID);

      expect(articleRepository.findById).toHaveBeenCalledWith(
        new UUID(ARTICLE_ID),
      );
      expect(articleRepository.delete).toHaveBeenCalledWith(
        new UUID(ARTICLE_ID),
      );
      expect(articleRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw NotFoundError when article does not exist', async () => {
      articleRepository.findById.mockResolvedValue(null);

      await expect(useCase.execute(AUTHOR_ACCOUNT, ARTICLE_ID)).rejects.toThrow(
        new NotFoundError(`Article with id '${ARTICLE_ID}' not found`),
      );

      expect(articleRepository.delete).not.toHaveBeenCalled();
    });

    it('should throw ForbiddenError when user does not have DELETE:ARTICLE permission', async () => {
      const article = new ArticleEntity(
        ARTICLE_ID,
        'Test Article',
        'a'.repeat(100),
        new Date('2024-01-01'),
        new Date('2024-01-01'),
        AUTHOR_ACCOUNT,
      );

      articleRepository.findById.mockResolvedValue(article);

      await expect(
        useCase.execute(NO_PERMISSION_ACCOUNT, ARTICLE_ID),
      ).rejects.toThrow(
        new ForbiddenError('You are not allowed to delete this article'),
      );

      expect(articleRepository.delete).not.toHaveBeenCalled();
    });
  });
});
