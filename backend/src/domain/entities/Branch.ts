import { BaseEntity } from './BaseEntity';

export interface BranchProps {
  name: string;
  location: string;
}

export class Branch extends BaseEntity {
  private _name: string;
  private _location: string;

  constructor(id: string, createdAt: Date, updatedAt: Date, props: BranchProps) {
    super(id, createdAt, updatedAt);
    this._name = props.name;
    this._location = props.location;
  }

  get name(): string {
    return this._name;
  }

  get location(): string {
    return this._location;
  }

  updateDetails(name: string, location: string): void {
    this._name = name;
    this._location = location;
    this.markModified();
  }
}
