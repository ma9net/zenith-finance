import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '@zenith-finance/data-access';
import { FormsModule } from '@angular/forms';
import { SummaryCard } from '@zenith-finance/ui'

@Component({
  standalone: true,
  selector: 'lib-dashboard',
  imports: [CommonModule, FormsModule, SummaryCard],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  public finance = inject(FinanceService);

  // Local state for the "Add" inputs
  newAmount = signal('');
  newCategory = signal('');

  submitTransaction() {
    const amount = this.newAmount();
    const category = this.newCategory();

    if (amount) {
      this.finance.addTransaction(amount, category);

      this.newAmount.set('');
      this.newCategory.set('');
    }
  }

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
}
