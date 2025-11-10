import { Injectable, signal } from '@angular/core';

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private idCounter = 0;
  readonly notifications = signal<Notification[]>([]);

  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', duration: number = 5000): void {
    const notification: Notification = {
      id: this.idCounter++,
      message,
      type,
      duration,
    };

    this.notifications.update((current) => [...current, notification]);

    if (duration > 0) {
      setTimeout(() => {
        this.remove(notification.id);
      }, duration);
    }
  }

  success(message: string, duration: number = 5000): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration: number = 7000): void {
    this.show(message, 'error', duration);
  }

  info(message: string, duration: number = 5000): void {
    this.show(message, 'info', duration);
  }

  warning(message: string, duration: number = 6000): void {
    this.show(message, 'warning', duration);
  }

  remove(id: number): void {
    this.notifications.update((current) => current.filter((n) => n.id !== id));
  }

  clear(): void {
    this.notifications.set([]);
  }
}

