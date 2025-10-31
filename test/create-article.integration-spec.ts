import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CreateArticleUseCase } from '../src/modules/article/usecases/create-article.usecase';
import { DbArticleRepository } from '../src/infra/repositories/db-article.repository';
import { DbAccountRepository } from '../src/infra/repositories/db-account.repository';
import { DbRoleRepository } from '../src/infra/repositories/db-role.repository';
import { DbArticleEntity } from '../src/infra/database/entities/db-article.entity';
import { DbAccountEntity } from '../src/infra/database/entities/db-account.entity';
import { DbRoleEntity } from '../src/infra/database/entities/db-role.entity';
import { AccountEntity } from '../src/domain/entities/account.entity';
import { ForbiddenError } from '../src/domain/errors/forbidden.error';
import { AppDataSource } from '../src/infra/database/data-source';

describe('CreateArticleUseCase - Integration', () => {
  let useCase: CreateArticleUseCase;
  let accountRepository: DbAccountRepository;
  let roleRepository: DbRoleRepository;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          ...AppDataSource.options,
          synchronize: false,
        }),
        TypeOrmModule.forFeature([
          DbArticleEntity,
          DbAccountEntity,
          DbRoleEntity,
        ]),
      ],
      providers: [
        CreateArticleUseCase,
        {
          provide: 'ArticleRepository',
          useClass: DbArticleRepository,
        },
        {
          provide: 'AccountRepository',
          useClass: DbAccountRepository,
        },
        {
          provide: 'RoleRepository',
          useClass: DbRoleRepository,
        },
      ],
    }).compile();

    useCase = module.get<CreateArticleUseCase>(CreateArticleUseCase);
    accountRepository = module.get('AccountRepository');
    roleRepository = module.get('RoleRepository');
  });

  afterAll(async () => {
    await module.close();
  });

  it('should create an article successfully when the user has permission', async () => {
    const editorRole = await roleRepository.findByName('EDITOR');
    if (!editorRole) {
      throw new Error('EDITOR role not found. Run migrations first!');
    }

    const author = new AccountEntity(
      crypto.randomUUID(),
      'John Doe',
      'john@example.com',
      'hashed123',
      new Date(),
      new Date(),
      editorRole,
    );
    await accountRepository.create(author);

    const createArticleDto = {
      title: 'My Integration Test Article',
      content:
        'This is a test article content with more than 100 characters to pass validation. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.',
    };

    const result = await useCase.execute(author, createArticleDto);

    expect(result).toHaveProperty('id');
    expect(result.title).toBe('My Integration Test Article');
    expect(result.slug).toContain('my-integration-test-article');
    expect(result.content).toBe(createArticleDto.content);
    expect(result.author.id).toBe(author.getId());
    expect(result.author.name).toBe('John Doe');
    expect(result.author.email).toBe('john@example.com');
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(result.updatedAt).toBeInstanceOf(Date);
  });

  it('should throw ForbiddenError when the user does not have permission', async () => {
    const readerRole = await roleRepository.findByName('READER');
    if (!readerRole) {
      throw new Error('READER role not found. Run migrations first!');
    }

    const unauthorizedUser = new AccountEntity(
      crypto.randomUUID(),
      'Jane Doe',
      'jane@example.com',
      'hashed456',
      new Date(),
      new Date(),
      readerRole,
    );
    await accountRepository.create(unauthorizedUser);

    const createArticleDto = {
      title: 'Unauthorized Article',
      content:
        'This should fail because user does not have CREATE permission. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor.',
    };

    await expect(
      useCase.execute(unauthorizedUser, createArticleDto),
    ).rejects.toThrow(
      new ForbiddenError('You are not allowed to create articles'),
    );
  });
});
