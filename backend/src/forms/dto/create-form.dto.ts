import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateFormDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  entityType: string;
}

export class UpdateFormDto {
  @IsString()
  @IsOptional()
  name?: string;
}

