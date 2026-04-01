/**
 * Value Object representing a currency amount.
 * Prevents issues with raw integer/float math in standard logic.
 */
export class Money {
  private readonly _amountInCents: number;

  private constructor(amountInCents: number) {
    if (!Number.isInteger(amountInCents) || amountInCents < 0) {
      throw new Error("Money amount must be a positive integer representing cents.");
    }
    this._amountInCents = amountInCents;
  }

  /**
   * Creates a Money instance from a whole value (e.g., dollars).
   */
  static fromUnits(units: number): Money {
    return new Money(Math.round(units * 100));
  }

  /**
   * Creates a Money instance directly from cents to avoid floating point issues.
   */
  static fromCents(cents: number): Money {
    return new Money(cents);
  }

  get amountInCents(): number {
    return this._amountInCents;
  }

  get formatted(): string {
    return `$${(this._amountInCents / 100).toFixed(2)}`;
  }

  add(other: Money): Money {
    return new Money(this._amountInCents + other.amountInCents);
  }

  subtract(other: Money): Money {
    const newAmount = this._amountInCents - other.amountInCents;
    if (newAmount < 0) throw new Error("Resulting money cannot be negative.");
    return new Money(newAmount);
  }

  multiply(factor: number): Money {
    // Ensuring the result is an integer
    return new Money(Math.round(this._amountInCents * factor));
  }
}
