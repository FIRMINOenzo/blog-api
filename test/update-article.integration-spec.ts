import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UpdateArticleUseCase } from '../src/modules/article/usecases/update-article.usecase';
import { DbArticleRepository } from '../src/infra/repositories/db-article.repository';
import { DbAccountRepository } from '../src/infra/repositories/db-account.repository';
import { DbRoleRepository } from '../src/infra/repositories/db-role.repository';
import { DbArticleEntity } from '../src/infra/database/entities/db-article.entity';
import { DbAccountEntity } from '../src/infra/database/entities/db-account.entity';
import { DbRoleEntity } from '../src/infra/database/entities/db-role.entity';
import { AccountEntity } from '../src/domain/entities/account.entity';
import { ArticleEntity } from '../src/domain/entities/article.entity';
import { ForbiddenError } from '../src/domain/errors/forbidden.error';
import { AppDataSource } from '../src/infra/database/data-source';

describe('UpdateArticleUseCase - Integration', () => {
  let useCase: UpdateArticleUseCase;
  let accountRepository: DbAccountRepository;
  let articleRepository: DbArticleRepository;
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
        UpdateArticleUseCase,
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

    useCase = module.get<UpdateArticleUseCase>(UpdateArticleUseCase);
    accountRepository = module.get('AccountRepository');
    articleRepository = module.get('ArticleRepository');
    roleRepository = module.get('RoleRepository');
  });

  afterAll(async () => {
    await module.close();
  });

  it('should update an article successfully when user has permission', async () => {
    const editorRole = await roleRepository.findByName('EDITOR');
    if (!editorRole) {
      throw new Error('EDITOR role not found. Run migrations first!');
    }

    const editor = new AccountEntity(
      crypto.randomUUID(),
      'Editor User',
      'editor@test.com',
      'hashed123',
      new Date(),
      new Date(),
      editorRole,
    );
    await accountRepository.create(editor);

    const longContent =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.';
    const article = new ArticleEntity(
      crypto.randomUUID(),
      'Original Title',
      longContent,
      new Date(),
      new Date(),
      editor,
    );
    await articleRepository.create(article);

    const updateDto = {
      title: 'Updated Title',
      content:
        'Updated content with more than 100 characters to pass validation. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent commodo cursus magna vel scelerisque nisl consectetur.',
    };

    const result = await useCase.execute(editor, article.getId(), updateDto);

    expect(result.id).toBe(article.getId());
    expect(result.title).toBe('Updated Title');
    expect(result.slug).toContain('updated-title');
    expect(result.content).toBe(updateDto.content);
    expect(result.updatedAt.getTime()).toBeGreaterThan(
      article.getCreatedAt().getTime(),
    );
  });

  it('should throw ForbiddenError when user does not have permission', async () => {
    const editorRole = await roleRepository.findByName('EDITOR');
    const readerRole = await roleRepository.findByName('READER');
    if (!editorRole || !readerRole) {
      throw new Error('Roles not found. Run migrations first!');
    }

    const editor = new AccountEntity(
      crypto.randomUUID(),
      'Article Author',
      'author@test.com',
      'hashed123',
      new Date(),
      new Date(),
      editorRole,
    );
    await accountRepository.create(editor);

    const reader = new AccountEntity(
      crypto.randomUUID(),
      'Reader User',
      'reader2@test.com',
      'hashed456',
      new Date(),
      new Date(),
      readerRole,
    );
    await accountRepository.create(reader);

    const longContent =
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit.';
    const article = new ArticleEntity(
      crypto.randomUUID(),
      'Article by Editor',
      longContent,
      new Date(),
      new Date(),
      editor,
    );
    await articleRepository.create(article);

    const updateDto = {
      title: 'Trying to Update',
    };

    await expect(
      useCase.execute(reader, article.getId(), updateDto),
    ).rejects.toThrow(
      new ForbiddenError('You are not allowed to update articles'),
    );
  });
});
