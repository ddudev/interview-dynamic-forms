import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormsService, CreateFormFieldDto } from '../shared/services/forms.service';
import { NotificationService } from '../shared/services/notification.service';
import { Form, FormField } from '../shared/models/form.model';

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './form-builder.component.html',
  styleUrl: './form-builder.component.scss',
})
export class FormBuilderComponent {
  private fb = inject(FormBuilder);
  private formsService = inject(FormsService);
  public router = inject(Router);
  private route = inject(ActivatedRoute);
  private notificationService = inject(NotificationService);

  readonly formForm: FormGroup;
  readonly fields = signal<FormField[]>([]);
  readonly currentForm = signal<Form | null>(null);
  readonly editingFieldIndex = signal<number | null>(null);
  readonly fieldTypes = ['text', 'number', 'date', 'email', 'select', 'textarea'];
  readonly isEditMode = signal(false);
  readonly formId = signal<number | null>(null);
  
  // Computed signals for derived state
  readonly hasFields = computed(() => this.fields().length > 0);
  readonly isEmpty = computed(() => this.fields().length === 0);
  readonly formTitle = computed(() => this.isEditMode() ? 'Edit Form' : 'Form Builder');
  readonly saveButtonText = computed(() => this.isEditMode() ? 'Update Form' : 'Save Form');

  // Convert route params to signal
  private routeParams = toSignal(this.route.params, { initialValue: {} });

  constructor() {
    this.formForm = this.fb.group({
      name: ['', Validators.required],
      entityType: ['Event', Validators.required],
    });

    // Watch route params for changes
    effect(() => {
      const params = this.routeParams();
      if (params && 'id' in params && params['id']) {
        this.formId.set(+params['id']);
        this.isEditMode.set(true);
        this.loadFormForEdit();
      }
    }, { allowSignalWrites: true });
  }

  loadFormForEdit(): void {
    const id = this.formId();
    if (!id) return;
    
    this.formsService.getForm(id).subscribe({
      next: (form) => {
        this.currentForm.set(form);
        this.formForm.patchValue({
          name: form.name,
          entityType: form.entityType,
        });
        
        if (form.fields) {
          this.fields.set(form.fields.map((field) => ({
            ...field,
            errorMessages: field.errorMessages || {
              required: '',
              email: '',
              number: '',
              pattern: '',
            },
          })));
        }
      },
      error: (error) => {
        console.error('Error loading form for edit:', error);
        this.notificationService.error('Error loading form. Please try again.');
        this.router.navigate(['/forms']);
      },
    });
  }

  addField(): void {
    const currentFields = this.fields();
    const newField: Partial<FormField> = {
      fieldName: '',
      fieldType: 'text',
      label: '',
      required: false,
      options: null,
      errorMessages: {
        required: '',
        email: '',
        number: '',
        pattern: '',
      },
      displayOrder: currentFields.length,
    };
    this.fields.update((fields) => [...fields, newField as FormField]);
    this.editingFieldIndex.set(currentFields.length);
  }

  removeField(index: number): void {
    const currentFields = this.fields();
    const field = currentFields[index];
    
    // If it's an existing field (has ID), we need to delete it from backend
    if (this.isEditMode() && this.formId() && field.id) {
      // Remove from UI immediately for better UX
      this.fields.update((fields) => fields.filter((_, i) => i !== index));
      this.updateDisplayOrders();
      
      // Delete from backend
      this.formsService.deleteField(this.formId()!, field.id).subscribe({
        next: () => {
          this.notificationService.success('Field removed successfully');
        },
        error: (error) => {
          console.error('Error removing field:', error);
          this.notificationService.error('Error removing field. Please try again.');
          // Reload fields to restore the UI state
          if (this.formId()) {
            this.loadFormForEdit();
          }
        },
      });
    } else {
      // Just remove from local array for new fields
      this.fields.update((fields) => fields.filter((_, i) => i !== index));
      this.updateDisplayOrders();
    }
  }

  updateDisplayOrders(): void {
    this.fields.update((fields) => 
      fields.map((field, index) => ({ ...field, displayOrder: index }))
    );
  }

  moveFieldUp(index: number): void {
    if (index > 0) {
      this.fields.update((fields) => {
        const newFields = [...fields];
        [newFields[index], newFields[index - 1]] = [
          newFields[index - 1],
          newFields[index],
        ];
        return newFields.map((field, i) => ({ ...field, displayOrder: i }));
      });
    }
  }

  moveFieldDown(index: number): void {
    const currentFields = this.fields();
    if (index < currentFields.length - 1) {
      this.fields.update((fields) => {
        const newFields = [...fields];
        [newFields[index], newFields[index + 1]] = [
          newFields[index + 1],
          newFields[index],
        ];
        return newFields.map((field, i) => ({ ...field, displayOrder: i }));
      });
    }
  }

  updateFieldOptions(field: FormField, value: string): void {
    if (field.fieldType === 'select') {
      const options = value.split(',').map((opt) => opt.trim()).filter((opt) => opt);
      field.options = { options };
    } else {
      field.options = null;
    }
    // Update the field in the signal
    this.fields.update((fields) => 
      fields.map((f) => f === field ? { ...f, options: field.options } : f)
    );
  }

  cleanErrorMessages(errorMessages?: FormField['errorMessages']): CreateFormFieldDto['errorMessages'] {
    if (!errorMessages) return undefined;
    
    const cleaned: any = {};
    if (errorMessages.required && errorMessages.required.trim()) {
      cleaned.required = errorMessages.required.trim();
    }
    if (errorMessages.email && errorMessages.email.trim()) {
      cleaned.email = errorMessages.email.trim();
    }
    if (errorMessages.number && errorMessages.number.trim()) {
      cleaned.number = errorMessages.number.trim();
    }
    if (errorMessages.pattern && errorMessages.pattern.trim()) {
      cleaned.pattern = errorMessages.pattern.trim();
    }
    
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  async saveForm(): Promise<void> {
    if (this.formForm.invalid) {
      this.formForm.markAllAsTouched();
      return;
    }

    const currentFields = this.fields();
    // Validate fields before saving
    const invalidFields = currentFields.filter(
      (field) => !field.fieldName || !field.label,
    );
    if (invalidFields.length > 0) {
      this.notificationService.warning('Please fill in all field names and labels before saving.');
      return;
    }

    // Validate field types
    const invalidFieldTypes = currentFields.filter(
      (field) => !this.fieldTypes.includes(field.fieldType),
    );
    if (invalidFieldTypes.length > 0) {
      this.notificationService.warning('Please select valid field types for all fields.');
      return;
    }

    try {
      const formData = this.formForm.value;
      const editMode = this.isEditMode();
      const formId = this.formId();
      
      if (editMode && formId) {
        // Update existing form metadata
        await this.formsService.updateForm(formId, formData).toPromise();
        
        // Get current fields from backend to check which are new
        const existingFields = await this.formsService.getFields(formId).toPromise();
        if (!existingFields) {
          throw new Error('Failed to load existing fields');
        }
        const existingFieldIds = new Set(existingFields.map(f => f.id));
        
        // Only add new fields (fields without IDs)
        for (const field of currentFields) {
          if (field.fieldName && field.label && !field.id) {
            const fieldData: CreateFormFieldDto = {
              fieldName: field.fieldName,
              fieldType: field.fieldType,
              label: field.label,
              required: field.required || false,
              options: field.options,
              errorMessages: this.cleanErrorMessages(field.errorMessages),
              displayOrder: field.displayOrder,
            };
            await this.formsService.addField(formId, fieldData).toPromise();
          }
        }
        
        this.notificationService.success('Form updated successfully!');
        this.router.navigate(['/forms', formId]);
      } else {
        // Create new form
        const form = await this.formsService.createForm(formData).toPromise();
        this.currentForm.set(form!);

        // Add fields one by one
        for (const field of currentFields) {
          if (field.fieldName && field.label) {
            const fieldData: CreateFormFieldDto = {
              fieldName: field.fieldName,
              fieldType: field.fieldType,
              label: field.label,
              required: field.required || false,
              options: field.options,
              errorMessages: this.cleanErrorMessages(field.errorMessages),
              displayOrder: field.displayOrder,
            };
            await this.formsService.addField(form!.id, fieldData).toPromise();
          }
        }

        this.notificationService.success('Form created successfully!');
        this.router.navigate(['/forms', form!.id]);
      }
    } catch (error) {
      console.error('Error saving form:', error);
      this.notificationService.error('Error saving form. Please try again.');
    }
  }
}
