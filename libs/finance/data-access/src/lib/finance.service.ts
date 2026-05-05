import {
  Injectable,
  signal,
  computed,
  effect,
  PLATFORM_ID,
  inject,
  resource,
} from '@angular/core';
import { MathUtils } from './utils/math-utils';
import { isPlatformBrowser } from '@angular/common';
import Big from 'big.js';
import { CsvUtils } from './utils/csv-utils';

export interface Transaction {
  id: string;
  amount: string;
  category: string;
  date: Date;
}

export type CurrencyCode = 'EUR' | 'USD' | 'GBP';
export type FilterPeriod = 'all' | 'today' | 'week' | 'month';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly STORAGE_KEY = 'zenith_audit_trail';

  // --- State Signals ---
  private readonly transactions = signal<Transaction[]>([]);
  readonly searchQuery = signal<string>('');
  readonly activePeriod = signal<FilterPeriod>('all');
  readonly selectedCurrency = signal<CurrencyCode>('EUR');
  readonly taxRate = signal<number>(0.2);

  // Mock Exchange Rates (EUR as Base)
  private readonly rates: Record<CurrencyCode, number> = {
    EUR: 1,
    USD: 1.09,
    GBP: 0.84,
  };

  /**
   * Fetch LTC Price
   */
  ltcResource = resource({
    loader: async () => {
      if (!this.isBrowser) return null;
      try {
        const response = await fetch(
          'https://api.coinbase.com/v2/prices/LTC-EUR/spot',
        );
        const data = await response.json();
        return new Big(data?.data?.amount ?? '0');
      } catch {
        return new Big(0);
      }
    },
  });

  // --- Computed Views ---

  filteredHistory = computed(() => {
    const list = this.transactions();
    const query = this.searchQuery().toLowerCase().trim();
    const period = this.activePeriod();
    const now = new Date();

    return list.filter((t) => {
      const matchesSearch =
        t.category.toLowerCase().includes(query) || t.amount.includes(query);
      if (!matchesSearch) return false;
      if (period === 'all') return true;

      const txDate = new Date(t.date);
      switch (period) {
        case 'today':
          return txDate.toDateString() === now.toDateString();
        case 'week':
          const weekAgo = new Date();
          weekAgo.setDate(now.getDate() - 7);
          return txDate >= weekAgo;
        case 'month':
          return (
            txDate.getMonth() === now.getMonth() &&
            txDate.getFullYear() === now.getFullYear()
          );
        default:
          return true;
      }
    });
  });

  /**
   * Internal Big instance for precise calculations
   */
  private rawTotalBalance = computed(() => {
    return this.transactions().reduce(
      (acc, t) => acc.plus(new Big(t.amount || 0)),
      new Big(0),
    );
  });

  totalBalance = computed(() => this.rawTotalBalance().toFixed(2));

  taxAmount = computed(() =>
    this.rawTotalBalance().times(this.taxRate()).toFixed(2),
  );

  totalWithTax = computed(() =>
    this.rawTotalBalance()
      .times(1 + this.taxRate())
      .toFixed(2),
  );

  totalInLtc = computed(() => {
    const totalEur = new Big(this.totalWithTax());
    const ltcPrice = this.ltcResource.value() || new Big(1);
    return ltcPrice.gt(0) ? totalEur.div(ltcPrice).toFixed(4) : '0.0000';
  });

  currencySymbol = computed(() => {
    const symbols: Record<CurrencyCode, string> = {
      EUR: '€',
      USD: '$',
      GBP: '£',
    };
    return symbols[this.selectedCurrency()];
  });

  displayTotal = computed(() => {
    const rate = this.rates[this.selectedCurrency()];
    return new Big(this.totalWithTax()).times(rate).toFixed(2);
  });

  constructor() {
    this.hydrate();

    // Persist changes to LocalStorage
    effect(() => {
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
    if (!amount || isNaN(parseFloat(amount))) return;

    const newTx: Transaction = {
      id: crypto.randomUUID(),
      amount: new Big(amount).toFixed(2),
      category: category || 'General',
      date: new Date(),
    };

    this.transactions.update((prev) => [newTx, ...prev]);
  }

  /**
   * Removes a specific entry. Crucial for auditing accuracy.
   */
  deleteTransaction(id: string) {
    this.transactions.update((prev) => prev.filter((t) => t.id !== id));
  }

  /**
   * The "Panic Button": Quickly removes the most recent entry.
   */
  undoLast() {
    this.transactions.update((prev) => prev.slice(1));
  }

  /**
   * Wipe the entire audit trail (Requires confirmation in UI)
   */
  clearAll() {
    this.transactions.set([]);
  }

  // --- Analytics Engine ---

  /*
   * Logic to calculate percentages of categories for the UI
   **/
  categoryDistribution = computed(() => {
    const list = this.filteredHistory();
    if (list.length === 0) return [];

    const counts: Record<string, number> = {};
    list.forEach((t) => (counts[t.category] = (counts[t.category] || 0) + 1));

    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        percentage: (count / list.length) * 100,
      }))
      .sort((a, b) => b.percentage - a.percentage);
  });

  categoryTotals = computed(() => {
    const list = this.filteredHistory();
    const balance = this.rawTotalBalance();
    const totals: Record<string, Big> = {};

    // Aggregate totals
    list.forEach((t) => {
      const amt = new Big(t.amount);
      totals[t.category] = (totals[t.category] || new Big(0)).plus(amt);
    });

    // Map to the final structure
    return Object.entries(totals)
      .map(([name, total]) => {
        // Logic: If balance is 0, percentage is 0.
        // Otherwise, (CategoryTotal / GlobalTotal) * 100
        const percentageValue = balance.gt(0)
          ? Number(total.div(balance).times(100).toFixed(2))
          : 0;

        return {
          name,
          value: total.toFixed(2),
          percentage: percentageValue,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  });

  private hydrate() {
    if (!this.isBrowser) return;
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved).map((t: any) => ({
          ...t,
          date: new Date(t.date),
        }));
        this.transactions.set(parsed);
      } catch (e) {
        console.error('Failed to parse audit trail', e);
      }
    }
  }

  /**
   * Exports transaction data to a CSV file named "Zenith_Audit_YYYY-MM-DD.csv"
   * Includes columns: ID, Date, Category, and Amount in Euros.
   */
  exportToCsv() {
    const data = this.transactions().map((t) => ({
      ID: t.id,
      Date: t.date.toISOString(),
      Category: t.category,
      Amount_EUR: t.amount,
    }));

    const csvContent = CsvUtils.convertToCsv(data);
    const timestamp = new Date().toISOString().split('T')[0];
    CsvUtils.downloadFile(csvContent, `Zenith_Audit_${timestamp}.csv`);
  }
}
