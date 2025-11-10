import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsService } from '../shared/services/forms.service';
import { EntitiesService } from '../shared/services/entities.service';
import { NotificationService } from '../shared/services/notification.service';
import { ConfirmationService } from '../shared/services/confirmation.service';
import { Form, Entity, PaginatedResponse } from '../shared/models/form.model';

@Component({
  selector: 'app-form-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './form-detail.component.html',
  styleUrl: './form-detail.component.scss',
})
export class FormDetailComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private formsService = inject(FormsService);
  private entitiesService = inject(EntitiesService);
  private notificationService = inject(NotificationService);
  private confirmationService = inject(ConfirmationService);

  readonly formId = signal<number>(0);
  readonly form = signal<Form | null>(null);
  readonly entities = signal<Entity[]>([]);
  readonly columns = signal<string[]>([]);
  readonly loading = signal(false);
  readonly loadingForm = signal(false);
  readonly loadingEntities = signal(false);
  readonly page = signal(1);
  readonly limit = signal(10);
  readonly total = signal(0);
  readonly totalPages = computed(() => Math.ceil(this.total() / this.limit()));
  
  // Computed signals for derived state
  readonly hasForm = computed(() => this.form() !== null);
  readonly hasEntities = computed(() => this.entities().length > 0);
  readonly isEmpty = computed(() => !this.loadingEntities() && this.entities().length === 0);
  readonly canGoToPreviousPage = computed(() => this.page() > 1);
  readonly canGoToNextPage = computed(() => this.page() < this.totalPages());
  readonly columnsComputed = computed(() => {
    const currentEntities = this.entities();
    if (currentEntities.length === 0) {
      return ['id', 'form_version', 'created_at'];
    }

    // Extract all unique keys from entities
    const allKeys = new Set<string>();
    currentEntities.forEach((entity) => {
      Object.keys(entity).forEach((key) => {
        if (!['id', 'form_id', 'form_version', 'created_at', 'updated_at'].includes(key)) {
          allKeys.add(key);
        }
      });
    });

    // Standard columns first, then dynamic field columns
    return [
      'id',
      'form_version',
      ...Array.from(allKeys).sort(),
      'created_at',
    ];
  });

  // Convert route params to signal
  private routeParams = toSignal(this.route.params, { initialValue: {} });

  constructor() {
    // Watch route params for changes
    effect(() => {
      const params = this.routeParams();
      if (params && 'id' in params && params['id']) {
        this.formId.set(+params['id']);
        this.loadForm();
        this.loadEntities();
      }
    }, { allowSignalWrites: true });
  }

  loadForm(): void {
    const id = this.formId();
    if (!id) return;
    
    this.loadingForm.set(true);
    this.formsService.getForm(id).subscribe({
      next: (form) => {
        this.form.set(form);
        this.loadingForm.set(false);
      },
      error: (error) => {
        console.error('Error loading form:', error);
        this.notificationService.error('Error loading form. Please try again.');
        this.loadingForm.set(false);
      },
    });
  }

  loadEntities(): void {
    const id = this.formId();
    if (!id) return;
    
    this.loadingEntities.set(true);
    this.entitiesService.getEntities(id, this.page(), this.limit()).subscribe({
      next: (response: PaginatedResponse<Entity>) => {
        this.entities.set(response.data);
        this.total.set(response.total);
        this.loadingEntities.set(false);
      },
      error: (error) => {
        console.error('Error loading entities:', error);
        this.notificationService.error('Error loading submissions. Please try again.');
        this.loadingEntities.set(false);
      },
    });
  }

  extractColumns(): void {
    // Columns are now computed, so this method is no longer needed
    // Keeping for backwards compatibility if needed
    this.columns.set(this.columnsComputed());
  }

  getColumnLabel(column: string): string {
    // Convert snake_case to Title Case
    return column
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  getValue(entity: Entity, column: string): any {
    return entity[column] ?? '-';
  }

  goToPage(page: number): void {
    const totalPages = this.totalPages();
    if (page >= 1 && page <= totalPages) {
      this.page.set(page);
      this.loadEntities();
    }
  }

  navigateToFormFiller(): void {
    this.router.navigate(['/forms', this.formId(), 'fill']);
  }

  navigateBack(): void {
    this.router.navigate(['/forms']);
  }

  editForm(): void {
    this.router.navigate(['/forms', this.formId(), 'edit']);
  }

  async deleteForm(): Promise<void> {
    const form = this.form();
    const confirmed = await this.confirmationService.confirm({
      title: 'Delete Form',
      message: `Are you sure you want to delete the form "${form?.name}"? This action cannot be undone and will also delete all submissions.`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      confirmButtonClass: 'btn-danger',
    });

    if (confirmed) {
      this.formsService.deleteForm(this.formId()).subscribe({
        next: () => {
          this.notificationService.success('Form deleted successfully');
          this.router.navigate(['/forms']);
        },
        error: (error) => {
          console.error('Error deleting form:', error);
          this.notificationService.error('Error deleting form. Please try again.');
        },
      });
    }
  }
}
