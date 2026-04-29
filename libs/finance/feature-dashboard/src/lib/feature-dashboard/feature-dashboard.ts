import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FinanceService } from '@zenith-finance/data-access';

@Component({
  selector: 'lib-feature-dashboard',
  imports: [CommonModule],
  templateUrl: './feature-dashboard.html',
  styleUrl: './feature-dashboard.css',
})
export class FeatureDashboard {
  public finance = inject(FinanceService);
}
