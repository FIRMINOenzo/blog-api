import { Test, TestingModule } from '@nestjs/testing';
import { CreateArticleUseCase } from './create-article.usecase';
import { ArticleRepository } from 'src/domain/repositories/article.repository';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { RoleEntity } from 'src/domain/entities/role.entity';
import { ForbiddenError } from 'src/domain/errors/forbidden.error';
import { ValueObjectValidationError } from 'src/domain/errors/value-object-validation.error';
import {
  Permission,
  PermissionAction,
  PermissionSubject,
} from 'src/domain/value-objects';

describe('CreateArticleUseCase', () => {
  let useCase: CreateArticleUseCase;
  let articleRepository: jest.Mocked<ArticleRepository>;

  const EDITOR_ROLE = new RoleEntity(
    '550e8400-e29b-41d4-a716-446655440000',
    'EDITOR',
    [new Permission(PermissionAction.CREATE, PermissionSubject.ARTICLE)],
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

  const VALID_INPUT = {
    title: 'My First Article',
    content: 'a'.repeat(100),
  };

  beforeEach(async () => {
    const mockArticleRepository: Partial<ArticleRepository> = {
      create: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateArticleUseCase,
        {
          provide: 'ArticleRepository',
          useValue: mockArticleRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateArticleUseCase>(CreateArticleUseCase);
    articleRepository = module.get('ArticleRepository');
  });

  describe('execute', () => {
    it('should create article successfully', async () => {
      const result = await useCase.execute(EDITOR_ACCOUNT, VALID_INPUT);

      expect(result).toEqual({
        id: expect.any(String) as string,
        title: VALID_INPUT.title,
        content: VALID_INPUT.content,
        slug: expect.stringMatching(/^my-first-article-[a-f0-9]{8}$/) as string,
        author: {
          id: EDITOR_ACCOUNT.getId(),
          name: EDITOR_ACCOUNT.getName(),
          email: EDITOR_ACCOUNT.getEmail(),
        },
        createdAt: expect.any(Date) as Date,
        updatedAt: expect.any(Date) as Date,
      });
      expect(articleRepository.create).toHaveBeenCalledTimes(1);
    });

    it('should generate slug from title', async () => {
      const input = {
        title: 'Criação de APIs RESTful',
        content: 'a'.repeat(100),
      };

      const result = await useCase.execute(EDITOR_ACCOUNT, input);

      expect(result.slug).toMatch(/^criacao-de-apis-restful-[a-f0-9]{8}$/);
    });

    it('should throw ForbiddenError when user lacks CREATE:ARTICLE permission', async () => {
      await expect(
        useCase.execute(READER_ACCOUNT, VALID_INPUT),
      ).rejects.toThrow(ForbiddenError);

      await expect(
        useCase.execute(READER_ACCOUNT, VALID_INPUT),
      ).rejects.toThrow('You are not allowed to create articles');

      expect(articleRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when title is invalid', async () => {
      const invalidInput = {
        title: 'abc',
        content: 'a'.repeat(100),
      };

      await expect(
        useCase.execute(EDITOR_ACCOUNT, invalidInput),
      ).rejects.toThrow(ValueObjectValidationError);

      expect(articleRepository.create).not.toHaveBeenCalled();
    });

    it('should throw error when content is too short', async () => {
      const invalidInput = {
        title: 'Valid Title',
        content: 'Short',
      };

      await expect(
        useCase.execute(EDITOR_ACCOUNT, invalidInput),
      ).rejects.toThrow(ValueObjectValidationError);

      expect(articleRepository.create).not.toHaveBeenCalled();
    });

    it('should set author correctly', async () => {
      const result = await useCase.execute(EDITOR_ACCOUNT, VALID_INPUT);

      expect(result.author.id).toBe(EDITOR_ACCOUNT.getId());
      expect(result.author.name).toBe(EDITOR_ACCOUNT.getName());
      expect(result.author.email).toBe(EDITOR_ACCOUNT.getEmail());
    });

    it('should set timestamps correctly', async () => {
      const result = await useCase.execute(EDITOR_ACCOUNT, VALID_INPUT);

      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
      expect(result.createdAt.getTime()).toBe(result.updatedAt.getTime());
    });

    it('should call repository create with article entity', async () => {
      await useCase.execute(EDITOR_ACCOUNT, VALID_INPUT);

      expect(articleRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          getId: expect.any(Function) as () => string,
          getTitle: expect.any(Function) as () => string,
          getContent: expect.any(Function) as () => string,
          getSlug: expect.any(Function) as () => string,
          getAuthor: expect.any(Function) as () => AccountEntity,
        }),
      );
    });
  });
});
