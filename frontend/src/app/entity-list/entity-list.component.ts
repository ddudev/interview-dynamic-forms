import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EntitiesService } from '../shared/services/entities.service';
import { NotificationService } from '../shared/services/notification.service';
import { Entity, PaginatedResponse } from '../shared/models/form.model';

@Component({
  selector: 'app-entity-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './entity-list.component.html',
  styleUrl: './entity-list.component.scss',
})
export class EntityListComponent {
  private entitiesService = inject(EntitiesService);
  private router = inject(Router);
  private notificationService = inject(NotificationService);

  readonly entities = signal<Entity[]>([]);
  readonly columns = signal<string[]>([]);
  readonly loading = signal(false);
  readonly page = signal(1);
  readonly limit = signal(10);
  readonly total = signal(0);
  readonly totalPages = computed(() => Math.ceil(this.total() / this.limit()));
  
  // Computed signals for derived state
  readonly hasEntities = computed(() => this.entities().length > 0);
  readonly isEmpty = computed(() => !this.loading() && this.entities().length === 0);
  readonly canGoToPreviousPage = computed(() => this.page() > 1);
  readonly canGoToNextPage = computed(() => this.page() < this.totalPages());
  readonly columnsComputed = computed(() => {
    const currentEntities = this.entities();
    if (currentEntities.length === 0) {
      return ['id', 'form_id', 'form_version', 'created_at'];
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
      'form_id',
      'form_version',
      ...Array.from(allKeys).sort(),
      'created_at',
    ];
  });

  constructor() {
    this.loadEntities();
  }

  loadEntities(): void {
    this.loading.set(true);
    this.entitiesService.getEntities(undefined, this.page(), this.limit()).subscribe({
      next: (response: PaginatedResponse<Entity>) => {
        this.entities.set(response.data);
        this.total.set(response.total);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading entities:', error);
        this.notificationService.error('Error loading entities. Please try again.');
        this.loading.set(false);
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

  navigateToFormBuilder(): void {
    this.router.navigate(['/forms/create']);
  }
}
