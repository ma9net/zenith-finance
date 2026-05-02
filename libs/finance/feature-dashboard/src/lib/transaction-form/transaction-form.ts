import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'lib-transaction-form',
  imports: [CommonModule],
  templateUrl: './transaction-form.html',
  styleUrl: './transaction-form.css',
})
export class TransactionForm {
  form = inject(FormBuilder);

  isFormValid = signal<boolean>(false);
}
