import { BaseEntity } from './BaseEntity';

export interface BookProps {
  title: string;
  author: string;
  isbn: string;
  publishedYear: number;
}

export class Book extends BaseEntity {
  private _title: string;
  private _author: string;
  private _isbn: string;
  private _publishedYear: number;

  constructor(id: string, createdAt: Date, updatedAt: Date, props: BookProps) {
    super(id, createdAt, updatedAt);
    this._title = props.title;
    this._author = props.author;
    this._isbn = props.isbn;
    this._publishedYear = props.publishedYear;
  }

  get title(): string {
    return this._title;
  }

  get author(): string {
    return this._author;
  }

  get isbn(): string {
    return this._isbn;
  }

  get publishedYear(): number {
    return this._publishedYear;
  }
}
