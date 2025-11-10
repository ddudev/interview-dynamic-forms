import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsObject,
  IsIn,
} from 'class-validator';

const ALLOWED_FIELD_TYPES = [
  'text',
  'number',
  'date',
  'email',
  'select',
  'textarea',
];

export class CreateFormFieldDto {
  @IsString()
  @IsNotEmpty()
  fieldName: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(ALLOWED_FIELD_TYPES)
  fieldType: string;

  @IsString()
  @IsNotEmpty()
  label: string;

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsObject()
  @IsOptional()
  options?: any;

  @IsObject()
  @IsOptional()
  errorMessages?: {
    required?: string;
    email?: string;
    number?: string;
    pattern?: string;
    [key: string]: string | undefined;
  };

  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

export class UpdateFormFieldDto {
  @IsString()
  @IsOptional()
  fieldName?: string;

  @IsString()
  @IsOptional()
  @IsIn(ALLOWED_FIELD_TYPES)
  fieldType?: string;

  @IsString()
  @IsOptional()
  label?: string;

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsObject()
  @IsOptional()
  options?: any;

  @IsObject()
  @IsOptional()
  errorMessages?: {
    required?: string;
    email?: string;
    number?: string;
    pattern?: string;
    [key: string]: string | undefined;
  };

  @IsNumber()
  @IsOptional()
  displayOrder?: number;
}

