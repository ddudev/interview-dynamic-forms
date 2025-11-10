import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmationService } from '../../services/confirmation.service';

@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-dialog.component.html',
  styleUrl: './confirmation-dialog.component.scss',
})
export class ConfirmationDialogComponent {
  private confirmationService = inject(ConfirmationService);
  readonly dialogData = this.confirmationService.dialogData;
  
  readonly show = computed(() => this.dialogData() !== null);
  readonly options = computed(() => {
    const data = this.dialogData();
    if (!data) return null;
    return {
      title: data.options.title || 'Confirm Action',
      message: data.options.message,
      confirmText: data.options.confirmText || 'OK',
      cancelText: data.options.cancelText || 'Cancel',
      confirmButtonClass: data.options.confirmButtonClass || 'btn-danger',
    };
  });

  confirm(): void {
    const data = this.dialogData();
    if (data) {
      data.resolve(true);
    }
  }

  cancel(): void {
    const data = this.dialogData();
    if (data) {
      data.resolve(false);
    }
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.cancel();
    }
  }
}

