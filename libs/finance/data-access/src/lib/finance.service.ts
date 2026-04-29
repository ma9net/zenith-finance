import { Injectable, signal, computed } from '@angular/core';
import Big from 'big.js';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  // 1. The Source of Truth (Signal)
  amount = signal<number>(0);
  taxRate = signal<number>(0.20); // 20% VAT (European standard)

  // 2. Computed Signals (Auto-update when amount changes)
  taxAmount = computed(() => {
    if (this.amount() <= 0) return '0.00';
    return new Big(this.amount()).times(this.taxRate()).toFixed(2);
  });

  totalWithTax = computed(() => {
    return new Big(this.amount()).plus(this.taxAmount()).toFixed(2);
  });

  updateAmount(newVal: string) {
    const parsed = parseFloat(newVal);
    this.amount.set(isNaN(parsed) ? 0 : parsed);
  }
}