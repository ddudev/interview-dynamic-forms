import { IsNumber, IsObject, IsNotEmpty } from 'class-validator';

export class CreateEntityDto {
  @IsNumber()
  @IsNotEmpty()
  formId: number;

  @IsObject()
  @IsNotEmpty()
  values: Record<string, any>;
}

