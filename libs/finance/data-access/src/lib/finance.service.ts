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

// Define the possible filter periods
export type FilterPeriod = 'all' | 'today' | 'week' | 'month';

@Injectable({ providedIn: 'root' })
export class FinanceService {
  private platformId = inject(PLATFORM_ID); // Inject the platform token
  private isBrowser = isPlatformBrowser(this.platformId); // Check if it's a browser

  private readonly STORAGE_KEY = 'zenith_audit_trail';

  activePeriod = signal<FilterPeriod>('all');

  // --- Signals ---
  private transactions = signal<Transaction[]>([]);
  searchQuery = signal<string>('');
  taxRate = signal<number>(0.2); // 20% VAT

  selectedCurrency = signal<CurrencyCode>('EUR');

  // Mock Exchange Rates (EUR is base)
  private rates: Record<CurrencyCode, number> = {
    EUR: 1,
    USD: 1.09,
    GBP: 0.84,
  };

  /**
   * THE RESOURCE API
   * Automatically fetches the LTC price and manages the "loading" state.
   */
  ltcResource = resource({
    loader: async () => {
      if (typeof window === 'undefined') {
        return null; // SSR skip
      }

      try {
        const response = await fetch(
          'https://api.coinbase.com/v2/prices/LTC-EUR/spot',
        );

        if (!response.ok) return null;

        const data = await response.json();
        return parseFloat(data?.data?.amount ?? '0');
      } catch {
        return null;
      }
    },
  });

  // --- Computed Views ---
  filteredHistory = computed(() => {
    const list = this.transactions();
    const query = this.searchQuery().toLowerCase().trim();
    const period = this.activePeriod();
    const now = new Date();

    // First: Filter by Search Query
    let results = list.filter(
      (t) =>
        t.category.toLowerCase().includes(query) || t.amount.includes(query),
    );

    // Second: Filter by Date Range
    if (period !== 'all') {
      results = results.filter((t) => {
        const txDate = new Date(t.date);

        switch (period) {
          case 'today':
            return txDate.toDateString() === now.toDateString();
          case 'week':
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(now.getDate() - 7);
            return txDate >= oneWeekAgo;
          case 'month':
            return (
              txDate.getMonth() === now.getMonth() &&
              txDate.getFullYear() === now.getFullYear()
            );
          default:
            return true;
        }
      });
    }

    return results;
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
    const currentPrice = this.ltcResource.value() || 1; // Fallback to 1 to avoid Div by Zero

    if (parseFloat(totalEur) === 0) return '0.0000';
    return new Big(totalEur).div(currentPrice).toFixed(4);
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

  currencySymbol = computed(() => {
    const symbols = { EUR: '€', USD: '$', GBP: '£' };
    return symbols[this.selectedCurrency()];
  });

  // Update the calculated values to respect the selection
  // We wrap the final total in the selected rate
  displayTotal = computed(() => {
    const baseTotal = this.totalWithTax(); // This is in EUR
    const rate = this.rates[this.selectedCurrency()];
    return new Big(baseTotal).times(rate).toFixed(2);
  });

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
    if (this.transactions().length === 0) return;
    this.transactions.update((prev) => prev.slice(1));
  }

  /**
   * Wipe the entire audit trail (Requires confirmation in UI)
   */
  clearAll() {
    this.transactions.set([]);
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
}
