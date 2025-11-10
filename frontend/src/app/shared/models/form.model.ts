export interface Form {
  id: number;
  name: string;
  entityType: string;
  createdAt: string;
  updatedAt: string;
  fields?: FormField[];
  _count?: {
    entities: number;
  };
}

export interface FormField {
  id: number;
  formId: number;
  fieldName: string;
  fieldType: string;
  label: string;
  required: boolean;
  options?: any;
  errorMessages?: {
    required?: string;
    email?: string;
    number?: string;
    pattern?: string;
    [key: string]: string | undefined;
  };
  displayOrder: number;
  isActive: boolean;
}

export interface FormVersion {
  id: number;
  formId: number;
  versionNumber: number;
  formDefinition: FormDefinition;
  createdAt: string;
}

export interface FormDefinition {
  fields: FieldDefinition[];
}

export interface FieldDefinition {
  id: number;
  field_name: string;
  field_type: string;
  label: string;
  required: boolean;
  options?: any;
  error_messages?: {
    required?: string;
    email?: string;
    number?: string;
    pattern?: string;
    [key: string]: string | undefined;
  };
  display_order: number;
}

export interface Entity {
  id: number;
  form_id: number;
  form_version: number;
  created_at: string;
  updated_at: string;
  [key: string]: any; // Dynamic field values
}

export interface EntityDisplay {
  form_id: number;
  form_version: number;
  submitted_at: string;
  fields: Array<FieldDefinition & { value: string | null }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

