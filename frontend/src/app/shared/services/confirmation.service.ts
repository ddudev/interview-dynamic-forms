import { Injectable, signal } from '@angular/core';

export interface ConfirmationOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmButtonClass?: string;
}

export interface ConfirmationDialogData {
  options: ConfirmationOptions;
  resolve: (result: boolean) => void;
}

@Injectable({
  providedIn: 'root',
})
export class ConfirmationService {
  readonly dialogData = signal<ConfirmationDialogData | null>(null);

  confirm(options: ConfirmationOptions): Promise<boolean> {
    return new Promise<boolean>((resolve) => {
      this.dialogData.set({
        options,
        resolve: (result: boolean) => {
          this.dialogData.set(null);
          resolve(result);
        },
      });
    });
  }
}

