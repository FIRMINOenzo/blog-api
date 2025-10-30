import { Test, TestingModule } from '@nestjs/testing';
import { ArticleController } from './article.controller';
import { CreateArticleUseCase } from './usecases/create-article.usecase';
import { ListArticlesUseCase } from './usecases/list-articles.usecase';
import { GetArticleByIdUseCase } from './usecases/get-article-by-id.usecase';
import { GetArticleBySlugUseCase } from './usecases/get-article-by-slug.usecase';
import { UpdateArticleUseCase } from './usecases/update-article.usecase';
import { DeleteArticleUseCase } from './usecases/delete-article.usecase';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { AccountEntity } from 'src/domain/entities/account.entity';
import { RoleEntity } from 'src/domain/entities/role.entity';
import {
  Permission,
  PermissionAction,
  PermissionSubject,
} from 'src/domain/value-objects';

describe('ArticleController', () => {
  let controller: ArticleController;
  let createArticleUseCase: jest.Mocked<CreateArticleUseCase>;
  let listArticlesUseCase: jest.Mocked<ListArticlesUseCase>;
  let getArticleByIdUseCase: jest.Mocked<GetArticleByIdUseCase>;
  let getArticleBySlugUseCase: jest.Mocked<GetArticleBySlugUseCase>;
  let updateArticleUseCase: jest.Mocked<UpdateArticleUseCase>;
  let deleteArticleUseCase: jest.Mocked<DeleteArticleUseCase>;

  const EDITOR_ROLE = new RoleEntity(
    '550e8400-e29b-41d4-a716-446655440000',
    'EDITOR',
    [new Permission(PermissionAction.CREATE, PermissionSubject.ARTICLE)],
  );

  const EDITOR_ACCOUNT = new AccountEntity(
    '550e8400-e29b-41d4-a716-446655440001',
    'Editor User',
    'editor@example.com',
    'hashed-password',
    new Date('2024-01-01'),
    new Date('2024-01-01'),
    EDITOR_ROLE,
  );

  const VALID_CREATE_DTO: CreateArticleDto = {
    title: 'My First Article',
    content: 'a'.repeat(100),
  };

  const VALID_UPDATE_DTO: UpdateArticleDto = {
    title: 'Updated Title',
    content: 'b'.repeat(100),
  };

  const ARTICLE_ID = '550e8400-e29b-41d4-a716-446655440002';

  beforeEach(async () => {
    const mockCreateArticleUseCase: Partial<CreateArticleUseCase> = {
      execute: jest.fn(),
    };

    const mockListArticlesUseCase: Partial<ListArticlesUseCase> = {
      execute: jest.fn(),
    };

    const mockGetArticleByIdUseCase: Partial<GetArticleByIdUseCase> = {
      execute: jest.fn(),
    };

    const mockGetArticleBySlugUseCase: Partial<GetArticleBySlugUseCase> = {
      execute: jest.fn(),
    };

    const mockUpdateArticleUseCase: Partial<UpdateArticleUseCase> = {
      execute: jest.fn(),
    };

    const mockDeleteArticleUseCase: Partial<DeleteArticleUseCase> = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        {
          provide: CreateArticleUseCase,
          useValue: mockCreateArticleUseCase,
        },
        {
          provide: ListArticlesUseCase,
          useValue: mockListArticlesUseCase,
        },
        {
          provide: GetArticleByIdUseCase,
          useValue: mockGetArticleByIdUseCase,
        },
        {
          provide: GetArticleBySlugUseCase,
          useValue: mockGetArticleBySlugUseCase,
        },
        {
          provide: UpdateArticleUseCase,
          useValue: mockUpdateArticleUseCase,
        },
        {
          provide: DeleteArticleUseCase,
          useValue: mockDeleteArticleUseCase,
        },
      ],
    }).compile();

    controller = module.get<ArticleController>(ArticleController);
    createArticleUseCase = module.get(CreateArticleUseCase);
    listArticlesUseCase = module.get(ListArticlesUseCase);
    getArticleByIdUseCase = module.get(GetArticleByIdUseCase);
    getArticleBySlugUseCase = module.get(GetArticleBySlugUseCase);
    updateArticleUseCase = module.get(UpdateArticleUseCase);
    deleteArticleUseCase = module.get(DeleteArticleUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call CreateArticleUseCase with correct input', async () => {
      const expectedOutput = {
        id: ARTICLE_ID,
        title: VALID_CREATE_DTO.title,
        content: VALID_CREATE_DTO.content,
        slug: 'my-first-article-55440002',
        author: {
          id: EDITOR_ACCOUNT.getId(),
          name: EDITOR_ACCOUNT.getName(),
          email: EDITOR_ACCOUNT.getEmail(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      createArticleUseCase.execute.mockResolvedValue(expectedOutput);

      await controller.create(EDITOR_ACCOUNT, VALID_CREATE_DTO);

      expect(createArticleUseCase.execute).toHaveBeenCalledWith(
        EDITOR_ACCOUNT,
        VALID_CREATE_DTO,
      );
      expect(createArticleUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should return article from CreateArticleUseCase', async () => {
      const expectedOutput = {
        id: ARTICLE_ID,
        title: VALID_CREATE_DTO.title,
        content: VALID_CREATE_DTO.content,
        slug: 'my-first-article-55440002',
        author: {
          id: EDITOR_ACCOUNT.getId(),
          name: EDITOR_ACCOUNT.getName(),
          email: EDITOR_ACCOUNT.getEmail(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      createArticleUseCase.execute.mockResolvedValue(expectedOutput);

      const result = await controller.create(EDITOR_ACCOUNT, VALID_CREATE_DTO);

      expect(result).toEqual(expectedOutput);
    });

    it('should propagate errors from CreateArticleUseCase', async () => {
      const error = new Error('You are not allowed to create articles');
      createArticleUseCase.execute.mockRejectedValue(error);

      await expect(
        controller.create(EDITOR_ACCOUNT, VALID_CREATE_DTO),
      ).rejects.toThrow('You are not allowed to create articles');
    });

    it('should handle validation errors from CreateArticleUseCase', async () => {
      const error = new Error('Title must be at least 5 characters long');
      createArticleUseCase.execute.mockRejectedValue(error);

      await expect(
        controller.create(EDITOR_ACCOUNT, VALID_CREATE_DTO),
      ).rejects.toThrow('Title must be at least 5 characters long');
    });
  });

  describe('list', () => {
    it('should call ListArticlesUseCase with current user and pagination', async () => {
      const expectedOutput = {
        data: [],
        meta: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      listArticlesUseCase.execute.mockResolvedValue(expectedOutput);

      const pagination = { page: 1, limit: 10 };
      await controller.list(EDITOR_ACCOUNT, pagination as any);

      expect(listArticlesUseCase.execute).toHaveBeenCalledWith(EDITOR_ACCOUNT, {
        page: 1,
        limit: 10,
      });
      expect(listArticlesUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should return articles list from ListArticlesUseCase', async () => {
      const expectedOutput = {
        data: [
          {
            id: ARTICLE_ID,
            title: 'Test Article',
            content: 'a'.repeat(100),
            slug: 'test-article-55440002',
            author: {
              id: EDITOR_ACCOUNT.getId(),
              name: EDITOR_ACCOUNT.getName(),
              email: EDITOR_ACCOUNT.getEmail(),
            },
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ],
        meta: {
          page: 1,
          limit: 10,
          total: 1,
          totalPages: 1,
          hasNextPage: false,
          hasPreviousPage: false,
        },
      };
      listArticlesUseCase.execute.mockResolvedValue(expectedOutput);

      const pagination = { page: 1, limit: 10 };
      const result = await controller.list(EDITOR_ACCOUNT, pagination as any);

      expect(result).toEqual(expectedOutput);
    });
  });

  describe('getById', () => {
    it('should call GetArticleByIdUseCase with correct id', async () => {
      const expectedOutput = {
        id: ARTICLE_ID,
        title: 'Test Article',
        content: 'a'.repeat(100),
        slug: 'test-article-55440002',
        author: {
          id: EDITOR_ACCOUNT.getId(),
          name: EDITOR_ACCOUNT.getName(),
          email: EDITOR_ACCOUNT.getEmail(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      getArticleByIdUseCase.execute.mockResolvedValue(expectedOutput);

      await controller.getById(EDITOR_ACCOUNT, ARTICLE_ID);

      expect(getArticleByIdUseCase.execute).toHaveBeenCalledWith(
        EDITOR_ACCOUNT,
        ARTICLE_ID,
      );
      expect(getArticleByIdUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should return article from GetArticleByIdUseCase', async () => {
      const expectedOutput = {
        id: ARTICLE_ID,
        title: 'Test Article',
        content: 'a'.repeat(100),
        slug: 'test-article-55440002',
        author: {
          id: EDITOR_ACCOUNT.getId(),
          name: EDITOR_ACCOUNT.getName(),
          email: EDITOR_ACCOUNT.getEmail(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      getArticleByIdUseCase.execute.mockResolvedValue(expectedOutput);

      const result = await controller.getById(EDITOR_ACCOUNT, ARTICLE_ID);

      expect(result).toEqual(expectedOutput);
    });
  });

  describe('getBySlug', () => {
    it('should call GetArticleBySlugUseCase with correct slug', async () => {
      const slug = 'test-article-55440002';
      const expectedOutput = {
        id: ARTICLE_ID,
        title: 'Test Article',
        content: 'a'.repeat(100),
        slug,
        author: {
          id: EDITOR_ACCOUNT.getId(),
          name: EDITOR_ACCOUNT.getName(),
          email: EDITOR_ACCOUNT.getEmail(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      getArticleBySlugUseCase.execute.mockResolvedValue(expectedOutput);

      await controller.getBySlug(EDITOR_ACCOUNT, slug);

      expect(getArticleBySlugUseCase.execute).toHaveBeenCalledWith(
        EDITOR_ACCOUNT,
        slug,
      );
      expect(getArticleBySlugUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should return article from GetArticleBySlugUseCase', async () => {
      const slug = 'test-article-55440002';
      const expectedOutput = {
        id: ARTICLE_ID,
        title: 'Test Article',
        content: 'a'.repeat(100),
        slug,
        author: {
          id: EDITOR_ACCOUNT.getId(),
          name: EDITOR_ACCOUNT.getName(),
          email: EDITOR_ACCOUNT.getEmail(),
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      getArticleBySlugUseCase.execute.mockResolvedValue(expectedOutput);

      const result = await controller.getBySlug(EDITOR_ACCOUNT, slug);

      expect(result).toEqual(expectedOutput);
    });
  });

  describe('update', () => {
    it('should call UpdateArticleUseCase with correct parameters', async () => {
      const expectedOutput = {
        id: ARTICLE_ID,
        title: VALID_UPDATE_DTO.title!,
        content: VALID_UPDATE_DTO.content!,
        slug: 'updated-title-55440002',
        author: {
          id: EDITOR_ACCOUNT.getId(),
          name: EDITOR_ACCOUNT.getName(),
          email: EDITOR_ACCOUNT.getEmail(),
        },
        updatedAt: new Date(),
      };
      updateArticleUseCase.execute.mockResolvedValue(expectedOutput);

      await controller.update(EDITOR_ACCOUNT, ARTICLE_ID, VALID_UPDATE_DTO);

      expect(updateArticleUseCase.execute).toHaveBeenCalledWith(
        EDITOR_ACCOUNT,
        ARTICLE_ID,
        VALID_UPDATE_DTO,
      );
      expect(updateArticleUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should return updated article from UpdateArticleUseCase', async () => {
      const expectedOutput = {
        id: ARTICLE_ID,
        title: VALID_UPDATE_DTO.title!,
        content: VALID_UPDATE_DTO.content!,
        slug: 'updated-title-55440002',
        author: {
          id: EDITOR_ACCOUNT.getId(),
          name: EDITOR_ACCOUNT.getName(),
          email: EDITOR_ACCOUNT.getEmail(),
        },
        updatedAt: new Date(),
      };
      updateArticleUseCase.execute.mockResolvedValue(expectedOutput);

      const result = await controller.update(
        EDITOR_ACCOUNT,
        ARTICLE_ID,
        VALID_UPDATE_DTO,
      );

      expect(result).toEqual(expectedOutput);
    });
  });

  describe('delete', () => {
    it('should call DeleteArticleUseCase with correct parameters', async () => {
      deleteArticleUseCase.execute.mockResolvedValue();

      await controller.delete(EDITOR_ACCOUNT, ARTICLE_ID);

      expect(deleteArticleUseCase.execute).toHaveBeenCalledWith(
        EDITOR_ACCOUNT,
        ARTICLE_ID,
      );
      expect(deleteArticleUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should propagate errors from DeleteArticleUseCase', async () => {
      const error = new Error('You can only delete your own articles');
      deleteArticleUseCase.execute.mockRejectedValue(error);

      await expect(
        controller.delete(EDITOR_ACCOUNT, ARTICLE_ID),
      ).rejects.toThrow('You can only delete your own articles');
    });
  });
});
