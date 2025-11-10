import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Entity, EntityDisplay, PaginatedResponse } from '../models/form.model';

@Injectable({
  providedIn: 'root',
})
export class EntitiesService {
  constructor(private api: ApiService) {}

  createEntity(formId: number, values: Record<string, any>): Observable<Entity> {
    return this.api.post<Entity>('entities', {
      formId,
      values,
    });
  }

  getEntities(
    formId?: number,
    page: number = 1,
    limit: number = 10,
  ): Observable<PaginatedResponse<Entity>> {
    const params: string[] = [];
    if (formId) params.push(`formId=${formId}`);
    params.push(`page=${page}`);
    params.push(`limit=${limit}`);
    const query = params.length > 0 ? `?${params.join('&')}` : '';
    return this.api.get<PaginatedResponse<Entity>>(`entities${query}`);
  }

  getEntity(id: number): Observable<Entity> {
    return this.api.get<Entity>(`entities/${id}`);
  }

  getEntityForDisplay(id: number): Observable<EntityDisplay> {
    return this.api.get<EntityDisplay>(`entities/${id}/display`);
  }
}

