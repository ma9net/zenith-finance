import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NxWelcome } from './nx-welcome';
import { FinanceService } from '@zenith-finance/data-access';
import { Dashboard } from '@zenith-finance/feature-dashboard';

@Component({
  imports: [RouterModule, Dashboard],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected title = 'zenith-finance';

  public finance = inject(FinanceService);
}
