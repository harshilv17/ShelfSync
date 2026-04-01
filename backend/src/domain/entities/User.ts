import { BaseEntity } from './BaseEntity';

export type UserRole = 'MEMBER' | 'LIBRARIAN' | 'ADMIN';

export interface UserProps {
  email: string;
  name: string;
  role: UserRole;
}

export class User extends BaseEntity {
  private _email: string;
  private _name: string;
  private _role: UserRole;

  constructor(id: string, createdAt: Date, updatedAt: Date, props: UserProps) {
    super(id, createdAt, updatedAt);
    this._email = props.email;
    this._name = props.name;
    this._role = props.role;
  }

  get email(): string {
    return this._email;
  }

  get name(): string {
    return this._name;
  }

  get role(): UserRole {
    return this._role;
  }

  // Basic permission checks directly inside the entity
  canManageInventory(): boolean {
    return this._role === 'LIBRARIAN' || this._role === 'ADMIN';
  }

  canManageUsers(): boolean {
    return this._role === 'ADMIN';
  }
}
