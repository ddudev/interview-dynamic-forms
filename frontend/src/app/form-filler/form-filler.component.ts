import { Component, inject, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsService } from '../shared/services/forms.service';
import { EntitiesService } from '../shared/services/entities.service';
import { NotificationService } from '../shared/services/notification.service';
import { Form, FormField } from '../shared/models/form.model';

@Component({
  selector: 'app-form-filler',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './form-filler.component.html',
  styleUrl: './form-filler.component.scss',
})
export class FormFillerComponent {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  public routerService = inject(Router);
  private formsService = inject(FormsService);
  private entitiesService = inject(EntitiesService);
  private notificationService = inject(NotificationService);

  readonly formId = signal<number>(0);
  readonly form = signal<Form | null>(null);
  readonly formGroup: FormGroup;
  readonly loading = signal(false);
  readonly submitting = signal(false);

  // Convert route params to signal
  private routeParams = toSignal(this.route.params, { initialValue: {} });

  constructor() {
    this.formGroup = this.fb.group({});

    // Watch route params for changes
    effect(() => {
      const params = this.routeParams();
      if (params && 'id' in params && params['id']) {
        this.formId.set(+params['id']);
        this.loadForm();
      }
    }, { allowSignalWrites: true });
  }

  loadForm(): void {
    const id = this.formId();
    if (!id) return;
    
    this.loading.set(true);
    this.formsService.getForm(id).subscribe({
      next: (form) => {
        this.form.set(form);
        this.buildFormGroup();
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading form:', error);
        this.notificationService.error('Error loading form. Please try again.');
        this.loading.set(false);
      },
    });
  }

  buildFormGroup(): void {
    const currentForm = this.form();
    if (!currentForm || !currentForm.fields) {
      return;
    }

    const group: any = {};
    currentForm.fields.forEach((field) => {
      const validators = [];
      if (field.required) {
        validators.push(Validators.required);
      }
      if (field.fieldType === 'email') {
        validators.push(Validators.email);
      }
      if (field.fieldType === 'number') {
        validators.push(Validators.pattern(/^-?\d*\.?\d+$/));
      }
      group[field.fieldName] = ['', validators];
    });

    // Clear existing controls and rebuild
    Object.keys(this.formGroup.controls).forEach(key => {
      this.formGroup.removeControl(key);
    });
    Object.keys(group).forEach(key => {
      this.formGroup.addControl(key, this.fb.control(group[key][0], group[key][1]));
    });
  }

  getFieldControl(fieldName: string) {
    return this.formGroup.get(fieldName);
  }

  isFieldInvalid(fieldName: string): boolean {
    const control = this.getFieldControl(fieldName);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  getErrorMessage(fieldName: string, errorType: string): string {
    // First try to get from form fields
    const currentForm = this.form();
    const field = currentForm?.fields?.find((f) => f.fieldName === fieldName);
    if (field?.errorMessages?.[errorType as keyof typeof field.errorMessages]) {
      return field.errorMessages[errorType as keyof typeof field.errorMessages]!;
    }
    
    // Default messages
    const defaultMessages: Record<string, string> = {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      pattern: 'Please enter a valid number',
    };
    
    return defaultMessages[errorType] || 'Invalid value';
  }

  getFieldOptions(field: FormField): string[] {
    if (field.fieldType === 'select' && field.options) {
      return field.options.options || [];
    }
    return [];
  }

  async onSubmit(): Promise<void> {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.submitting.set(true);
    const values = this.formGroup.value;

    try {
      const entity = await this.entitiesService
        .createEntity(this.formId(), values)
        .toPromise();
      this.notificationService.success('Form submitted successfully!');
      this.routerService.navigate(['/entities']);
    } catch (error) {
      console.error('Error submitting form:', error);
      this.notificationService.error('Error submitting form. Please try again.');
    } finally {
      this.submitting.set(false);
    }
  }
}
