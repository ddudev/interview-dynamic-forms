import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import {
  Form,
  FormField,
  FormVersion,
} from '../models/form.model';

@Injectable({
  providedIn: 'root',
})
export class FormsService {
  constructor(private api: ApiService) {}

  createForm(data: CreateFormDto): Observable<Form> {
    return this.api.post<Form>('forms', data);
  }

  getForms(): Observable<Form[]> {
    return this.api.get<Form[]>('forms');
  }

  getForm(id: number): Observable<Form> {
    return this.api.get<Form>(`forms/${id}`);
  }

  getFormVersions(formId: number): Observable<FormVersion[]> {
    return this.api.get<FormVersion[]>(`forms/${formId}/versions`);
  }

  updateForm(id: number, data: Partial<CreateFormDto>): Observable<Form> {
    return this.api.patch<Form>(`forms/${id}`, data);
  }

  deleteForm(id: number): Observable<void> {
    return this.api.delete<void>(`forms/${id}`);
  }

  // Form Fields
  addField(formId: number, field: CreateFormFieldDto): Observable<FormField> {
    return this.api.post<FormField>(`forms/${formId}/fields`, field);
  }

  getFields(formId: number): Observable<FormField[]> {
    return this.api.get<FormField[]>(`forms/${formId}/fields`);
  }

  updateField(
    formId: number,
    fieldId: number,
    field: UpdateFormFieldDto,
  ): Observable<FormField> {
    return this.api.patch<FormField>(
      `forms/${formId}/fields/${fieldId}`,
      field,
    );
  }

  deleteField(formId: number, fieldId: number): Observable<void> {
    return this.api.delete<void>(`forms/${formId}/fields/${fieldId}`);
  }
}

export interface CreateFormDto {
  name: string;
  entityType: string;
}

export interface CreateFormFieldDto {
  fieldName: string;
  fieldType: string;
  label: string;
  required?: boolean;
  options?: any;
  errorMessages?: {
    required?: string;
    email?: string;
    number?: string;
    pattern?: string;
    [key: string]: string | undefined;
  };
  displayOrder?: number;
}

export interface UpdateFormFieldDto {
  fieldName?: string;
  fieldType?: string;
  label?: string;
  required?: boolean;
  options?: any;
  displayOrder?: number;
}

