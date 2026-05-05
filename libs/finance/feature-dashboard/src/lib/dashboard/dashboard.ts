import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  CurrencyCode,
  FilterPeriod,
  FinanceService,
} from '@zenith-finance/data-access';
import {
  FormsModule,
  FormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { SummaryCard } from '@zenith-finance/ui'

@Component({
  standalone: true,
  selector: 'lib-dashboard',
  imports: [CommonModule, FormsModule, SummaryCard, ReactiveFormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  public finance = inject(FinanceService);
  private fb = inject(FormBuilder);

  // Local state for the "Add" inputs
  newAmount = signal('');
  newCategory = signal('');

  periods: FilterPeriod[] = ['all', 'today', 'week', 'month'];
  currencies: CurrencyCode[] = ['EUR', 'USD', 'GBP'];

  confirmClear() {
    if (
      confirm(
        'Are you sure? This will permanently wipe the entire Audit Trail.',
      )
    ) {
      this.finance.clearAll();
    }
  }

  exportData() {
    this.finance.exportToCsv();
  }

  auditForm = this.fb.group({
    category: ['', [Validators.required, Validators.minLength(2)]],
    amount: [
      '',
      [Validators.required, Validators.pattern(/^[0-9]+([.,][0-9]{1,2})?$/)],
    ],
  });

  submitTransaction() {
    if (this.auditForm.valid) {
      const { amount, category } = this.auditForm.value;
      this.finance.addTransaction(amount!, category!);
      this.auditForm.reset();
    }
  }
}
