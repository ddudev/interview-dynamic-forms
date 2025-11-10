import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormsService } from '../shared/services/forms.service';
import { NotificationService } from '../shared/services/notification.service';
import { ConfirmationService } from '../shared/services/confirmation.service';
import { Form } from '../shared/models/form.model';

@Component({
  selector: 'app-forms-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './forms-list.component.html',
  styleUrl: './forms-list.component.scss',
})
export class FormsListComponent {
  private formsService = inject(FormsService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  readonly loading = signal(false);
  readonly forms = signal<Form[]>([]);
  
  // Computed signals for derived state
  readonly hasForms = computed(() => this.forms().length > 0);
  readonly isEmpty = computed(() => !this.loading() && this.forms().length === 0);

  constructor() {
    // Load forms on init
    this.loadForms();
  }

  loadForms(): void {
    this.loading.set(true);
    this.formsService.getForms().subscribe({
      next: (forms) => {
        this.forms.set(forms);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading forms:', error);
        this.notificationService.error('Error loading forms. Please try again.');
        this.loading.set(false);
      },
    });
  }

  navigateToFormDetail(formId: number): void {
    this.router.navigate(['/forms', formId]);
  }

  navigateToFormFiller(formId: number): void {
    this.router.navigate(['/forms', formId, 'fill']);
  }

  navigateToFormBuilder(): void {
    this.router.navigate(['/forms/create']);
  }

  editForm(formId: number, event: Event): void {
    event.stopPropagation();
    this.router.navigate(['/forms', formId, 'edit']);
  }

  async deleteForm(formId: number, formName: string, event: Event): Promise<void> {
    event.stopPropagation();
    
    const confirmed = await this.confirmationService.confirm({
      title: 'Delete Form',
      message: `Are you sure you want to delete the form "${formName}"? This action cannot be undone and will also delete all submissions.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonClass: 'btn-danger',
    });

    if (confirmed) {
      this.formsService.deleteForm(formId).subscribe({
        next: () => {
          this.notificationService.success('Form deleted successfully');
          this.loadForms();
        },
        error: (error) => {
          console.error('Error deleting form:', error);
          this.notificationService.error('Error deleting form. Please try again.');
        },
      });
    }
  }
}
