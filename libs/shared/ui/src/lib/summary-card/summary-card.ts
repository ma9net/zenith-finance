import { Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  selector: 'lib-summary-card',
  imports: [CommonModule],
  templateUrl: './summary-card.html',
  styleUrl: './summary-card.css',
})
export class SummaryCard {
  label = input.required<string>();
  value = input.required<string>();
  icon = input<string>('💰');
  type = input<'primary' | 'success' | 'warning' | 'crypto'>('primary');

  cardClasses = computed(() => {
    const base = 'shadow-sm ';
    switch (this.type()) {
      case 'success':
        return base + 'bg-emerald-50 border-emerald-100 text-emerald-700';
      case 'warning':
        return base + 'bg-amber-50 border-amber-100 text-amber-700';
      case 'crypto':
        return base + 'bg-slate-900 border-slate-800 text-white';
      default:
        return base + 'bg-blue-50 border-blue-100 text-blue-700';
    }
  });
}
