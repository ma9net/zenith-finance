import {
  Injectable,
  signal,
  computed,
  effect,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { MathUtils } from './utils/math-utils';
import { isPlatformBrowser } from '@angular/common';
import Big from 'big.js';

export interface Transaction {
  id: string;
  amount: string;
  category: string;
  date: Date;
}

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private platformId = inject(PLATFORM_ID); // Inject the platform token
  private isBrowser = isPlatformBrowser(this.platformId); // Check if it's a browser

  private readonly STORAGE_KEY = 'zenith_audit_trail';

  // --- Signals ---
  private transactions = signal<Transaction[]>([]);
  searchQuery = signal<string>('');
  taxRate = signal<number>(0.2); // 20% VAT

  // --- CRYPTO ENGINE ---
  // In a real app, this would be updated via a WebSocket or HTTP Polling
  ltcPriceEur = signal<number>(85.5); // Mock Price: 1 LTC = €85.50

  // --- Computed Views ---
  filteredHistory = computed(() => {
    const query = this.searchQuery().toLowerCase().trim();
    const list = this.transactions();
    if (!query) return list;

    return list.filter(
      (t) =>
        t.category.toLowerCase().includes(query) || t.amount.includes(query),
    );
  });

  totalBalance = computed(() => {
    return this.transactions()
      .reduce((acc, t) => acc.plus(MathUtils.toSafeBig(t.amount)), new Big(0))
      .toFixed(2);
  });

  taxAmount = computed(() => {
    return new Big(this.totalBalance()).times(this.taxRate()).toFixed(2);
  });

  totalWithTax = computed(() => {
    return new Big(this.totalBalance()).plus(this.taxAmount()).toFixed(2);
  });

  totalInLtc = computed(() => {
    const totalEur = this.totalWithTax();

    // Guard clause to prevent division by zero or unnecessary math
    if (parseFloat(totalEur) === 0) return '0.0000';

    // We use Big.js division to prevent precision loss in crypto!
    return new Big(totalEur).div(this.ltcPriceEur()).toFixed(4); // Crypto uses 4 decimals
  });

  constructor() {
    if (this.isBrowser) {
      this.hydrate();
    }

    this.hydrate();
    // Auto-sync to LocalStorage
    effect(() => {
      // Only save if we are on the client side
      if (this.isBrowser) {
        localStorage.setItem(
          this.STORAGE_KEY,
          JSON.stringify(this.transactions()),
        );
      }
    });
  }

  // --- Actions ---
  addTransaction(amount: string, category: string) {
    const safeAmount = MathUtils.toSafeBig(amount);
    if (safeAmount.lte(0)) return;

    const newTx: Transaction = {
      id: crypto.randomUUID(),
      amount: safeAmount.toFixed(2),
      category: category || 'General',
      date: new Date(),
    };

    this.transactions.update((prev) => [newTx, ...prev]);
  }

  private hydrate() {
    if (!this.isBrowser) return;

    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved).map((t: any) => ({
        ...t,
        date: new Date(t.date),
      }));
      this.transactions.set(parsed);
    }
  }
}
