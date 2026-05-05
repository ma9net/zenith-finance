import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'lib-analytics-breakdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      class="overflow-hidden rounded-[2.5rem] border border-white bg-white/70 p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.05)] backdrop-blur-xl"
    >
      <div class="mb-8 flex items-center justify-between">
        <div>
          <h3
            class="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400"
          >
            Spending Analytics
          </h3>
          <p class="text-xs font-bold text-slate-500">Allocation by category</p>
        </div>
        <span
          class="rounded-full bg-blue-50 px-3 py-1 text-[10px] font-black text-blue-600 uppercase"
          >Live Audit</span
        >
      </div>

      <div class="space-y-7">
        @for (item of data(); track item.name; let i = $index) {
          <div class="group space-y-3">
            <div class="flex justify-between items-end">
              <div class="flex items-center gap-3">
                <!-- Dynamic color indicator -->
                <div
                  [class]="getIndicatorColor(i)"
                  class="h-2 w-2 rounded-full shadow-sm"
                ></div>
                <span
                  class="text-sm font-black text-slate-700 transition-colors group-hover:text-blue-600"
                >
                  {{ item.name }}
                </span>
              </div>
              <div class="text-right">
                <span class="font-mono text-sm font-black text-slate-900"
                  >{{ item.percentage | number: '1.0-1' }}%</span
                >
              </div>
            </div>

            <div
              class="relative h-3 w-full overflow-hidden rounded-full bg-slate-100/50"
            >
              <div
                class="h-full rounded-full transition-all duration-1000 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                [class]="getBarColor(i)"
                [style.width.%]="item.percentage"
              >
                <div
                  class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                ></div>
              </div>
            </div>
          </div>
        } @empty {
          <div
            class="flex flex-col items-center justify-center py-12 text-center"
          >
            <div
              class="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-50 text-xl text-slate-300"
            >
              📊
            </div>
            <p class="text-sm font-bold italic text-slate-400">
              No data available for this period
            </p>
          </div>
        }
      </div>
    </div>
  `,
})
export class AnalyticsBreakdown {
  // STRICT TYPING: Input is a signal returning an array of objects
  data =
    input.required<{ name: string; value: string; percentage: number }[]>();

  private colors = [
    { bg: 'bg-blue-600', dot: 'bg-blue-500' },
    { bg: 'bg-indigo-600', dot: 'bg-indigo-500' },
    { bg: 'bg-emerald-500', dot: 'bg-emerald-400' },
    { bg: 'bg-amber-500', dot: 'bg-amber-400' },
    { bg: 'bg-rose-500', dot: 'bg-rose-400' },
  ];

  getBarColor(index: number): string {
    return this.colors[index % this.colors.length].bg;
  }

  getIndicatorColor(index: number): string {
    return this.colors[index % this.colors.length].dot;
  }
}
