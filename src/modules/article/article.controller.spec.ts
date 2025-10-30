import { Test, TestingModule } from '@nestjs/testing';
import { ArticleController } from './article.controller';
import { CreateArticleUseCase } from './usecases/create-article.usecase';
import { CreateArticleDto } from './dto/create-article.dto';
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

  beforeEach(async () => {
    const mockCreateArticleUseCase: Partial<CreateArticleUseCase> = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ArticleController],
      providers: [
        {
          provide: CreateArticleUseCase,
          useValue: mockCreateArticleUseCase,
        },
      ],
    }).compile();

    controller = module.get<ArticleController>(ArticleController);
    createArticleUseCase = module.get(CreateArticleUseCase);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should call CreateArticleUseCase with correct input', async () => {
      const expectedOutput = {
        id: '550e8400-e29b-41d4-a716-446655440002',
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
        id: '550e8400-e29b-41d4-a716-446655440002',
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
});
