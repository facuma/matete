
export interface MoneyProps {
    amount: number;
    currency: string;
}

export class Money {
    readonly amount: number;
    readonly currency: string;

    constructor(amount: number, currency: string = 'ARS') {
        if (amount < 0) {
            // Allow negative for discounts, but generally be careful
            // throw new Error("Money amount cannot be negative"); 
        }
        // Round to 2 decimals to avoid floating point errors
        this.amount = Math.round(amount * 100) / 100;
        this.currency = currency;
    }

    add(other: Money): Money {
        if (other.currency !== this.currency) {
            throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
        }
        return new Money(this.amount + other.amount, this.currency);
    }

    subtract(other: Money): Money {
        if (other.currency !== this.currency) {
            throw new Error(`Currency mismatch: ${this.currency} vs ${other.currency}`);
        }
        return new Money(this.amount - other.amount, this.currency);
    }

    multiply(factor: number): Money {
        return new Money(this.amount * factor, this.currency);
    }

    percentage(percent: number): Money {
        return new Money(this.amount * (percent / 100), this.currency);
    }

    equals(other: Money): boolean {
        return this.amount === other.amount && this.currency === other.currency;
    }

    format(): string {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS', // Force ARS for now as it's the main currency
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(this.amount);
    }

    static zero(currency: string = 'ARS'): Money {
        return new Money(0, currency);
    }
}
