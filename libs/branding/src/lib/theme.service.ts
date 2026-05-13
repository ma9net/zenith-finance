import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private theme = signal<Theme>(
    (localStorage.getItem('zenith_theme') as Theme) || 'light',
  );

  readonly currentTheme = this.theme.asReadonly();

  constructor() {
    effect(() => {
      const mode = this.theme();
      localStorage.setItem('zenith_theme', mode);

      if (mode === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.removeAttribute('data-theme');
        document.documentElement.classList.remove('dark');
      }
    });
  }

  toggleTheme() {
    this.theme.update((t) => (t === 'light' ? 'dark' : 'light'));
  }
}
