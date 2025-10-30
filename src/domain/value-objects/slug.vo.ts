import { ValueObjectValidationError } from '../errors/value-object-validation.error';
import { ValueObject } from './value-object.interface';

export class Slug implements ValueObject<string> {
  private readonly value: string;

  private static readonly REMOVE_ACCENTS_REGEX = /[\u0300-\u036f]/g;
  private static readonly REMOVE_SPECIAL_CHARS_REGEX = /[^\w\s-]/g;
  private static readonly REPLACE_SPACES_REGEX = /\s+/g;
  private static readonly REMOVE_DUPLICATE_HYPHENS_REGEX = /-+/g;
  private static readonly REMOVE_START_AND_END_HYPHENS_REGEX = /(^-+)|(-+$)/g;
  private static readonly SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  constructor(value: string) {
    this.validate(value);
    this.value = value;
  }

  getValue(): string {
    return this.value;
  }

  static fromTitle(title: string): Slug {
    const slug = title
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(Slug.REMOVE_ACCENTS_REGEX, '')
      .replace(Slug.REMOVE_SPECIAL_CHARS_REGEX, '')
      .replace(Slug.REPLACE_SPACES_REGEX, '-')
      .replace(Slug.REMOVE_DUPLICATE_HYPHENS_REGEX, '-')
      .replace(Slug.REMOVE_START_AND_END_HYPHENS_REGEX, '');

    return new Slug(slug);
  }

  private validate(value: string): void {
    if (!value || value.trim().length === 0) {
      throw new ValueObjectValidationError('Slug cannot be empty');
    }

    if (!Slug.SLUG_PATTERN.test(value)) {
      throw new ValueObjectValidationError('Invalid slug format');
    }
  }
}
