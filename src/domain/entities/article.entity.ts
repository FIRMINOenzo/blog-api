import { AccountEntity } from './account.entity';
import {
  Content,
  PermissionAction,
  PermissionSubject,
  Slug,
  Title,
  UUID,
} from '../value-objects';
import { ForbiddenError } from '../errors/forbidden.error';

export class ArticleEntity {
  private readonly id: UUID;
  private title: Title;
  private content: Content;
  private slug: Slug;
  private readonly createdAt: Date;
  private updatedAt: Date;
  private readonly author: AccountEntity;

  constructor(
    id: string,
    title: string,
    content: string,
    createdAt: Date,
    updatedAt: Date,
    author: AccountEntity,
  ) {
    this.id = new UUID(id);
    this.title = new Title(title);
    this.content = new Content(content);
    this.slug = Slug.fromTitle(title, this.id);
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.author = author;
  }

  static create(
    author: AccountEntity,
    title: string,
    content: string,
  ): ArticleEntity {
    if (
      !author
        .getRole()
        ?.hasPermission(PermissionAction.CREATE, PermissionSubject.ARTICLE)
    ) {
      throw new ForbiddenError('You are not allowed to create articles');
    }
    const now = new Date();
    return new ArticleEntity(
      crypto.randomUUID(),
      title,
      content,
      now,
      now,
      author,
    );
  }

  update(allowedBy: AccountEntity, title?: string, content?: string): void {
    if (
      !allowedBy
        .getRole()
        ?.hasPermission(PermissionAction.UPDATE, PermissionSubject.ARTICLE)
    ) {
      throw new ForbiddenError('You are not allowed to update articles');
    }

    let changed = false;

    if (title) {
      this.title = new Title(title);
      this.slug = Slug.fromTitle(title, this.id);
      changed = true;
    }

    if (content) {
      this.content = new Content(content);
      changed = true;
    }

    if (changed) this.updatedAt = new Date();
  }

  getId(): string {
    return this.id.getValue();
  }

  getTitle(): string {
    return this.title.getValue();
  }

  getContent(): string {
    return this.content.getValue();
  }

  getSlug(): string {
    return this.slug.getValue();
  }

  getCreatedAt(): Date {
    return this.createdAt;
  }

  getUpdatedAt(): Date {
    return this.updatedAt;
  }

  getAuthor(): AccountEntity {
    return this.author;
  }
}
