import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FormsService } from '../forms/forms.service';
import { CreateFormFieldDto, UpdateFormFieldDto } from './dto/create-form-field.dto';

@Injectable()
export class FormFieldsService {
  constructor(
    private prisma: PrismaService,
    private formsService: FormsService,
  ) {}

  async create(formId: number, createFormFieldDto: CreateFormFieldDto) {
    await this.formsService.findOne(formId);

    // Check if field name already exists (active)
    const existingField = await this.prisma.formField.findFirst({
      where: {
        formId,
        fieldName: createFormFieldDto.fieldName,
        isActive: true,
      },
    });

    if (existingField) {
      throw new BadRequestException(
        `Field with name ${createFormFieldDto.fieldName} already exists`,
      );
    }

    const field = await this.prisma.formField.create({
      data: {
        formId,
        fieldName: createFormFieldDto.fieldName,
        fieldType: createFormFieldDto.fieldType,
        label: createFormFieldDto.label,
        required: createFormFieldDto.required ?? false,
        options: createFormFieldDto.options,
        errorMessages: createFormFieldDto.errorMessages,
        displayOrder: createFormFieldDto.displayOrder ?? 0,
      },
    });

    // Create new form version
    await this.formsService.createNewFormVersion(formId);

    return field;
  }

  async findAll(formId: number) {
    await this.formsService.findOne(formId);
    return this.prisma.formField.findMany({
      where: {
        formId,
        isActive: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });
  }

  async findOne(formId: number, fieldId: number) {
    await this.formsService.findOne(formId);
    const field = await this.prisma.formField.findFirst({
      where: {
        id: fieldId,
        formId,
      },
    });

    if (!field) {
      throw new NotFoundException(
        `Field with ID ${fieldId} not found in form ${formId}`,
      );
    }

    return field;
  }

  async update(
    formId: number,
    fieldId: number,
    updateFormFieldDto: UpdateFormFieldDto,
  ) {
    const oldField = await this.findOne(formId, fieldId);

    if (!oldField.isActive) {
      throw new BadRequestException('Cannot update inactive field');
    }

    // Create new version of the field
    const errorMessagesValue = updateFormFieldDto.errorMessages ?? 
      (oldField.errorMessages ? (oldField.errorMessages as any) : undefined);
    
    const newField = await this.prisma.formField.create({
      data: {
        formId,
        fieldName: updateFormFieldDto.fieldName ?? oldField.fieldName,
        fieldType: updateFormFieldDto.fieldType ?? oldField.fieldType,
        label: updateFormFieldDto.label ?? oldField.label,
        required: updateFormFieldDto.required ?? oldField.required,
        options: updateFormFieldDto.options ?? oldField.options,
        errorMessages: errorMessagesValue,
        displayOrder: updateFormFieldDto.displayOrder ?? oldField.displayOrder,
        version: oldField.version + 1,
      },
    });

    // Link old field to new field and deactivate
    await this.prisma.formField.update({
      where: { id: oldField.id },
      data: {
        isActive: false,
        replacedByFieldId: newField.id,
      },
    });

    // Create new form version
    await this.formsService.createNewFormVersion(formId);

    return newField;
  }

  async remove(formId: number, fieldId: number) {
    const field = await this.findOne(formId, fieldId);

    if (!field.isActive) {
      throw new BadRequestException('Field is already inactive');
    }

    // Soft delete
    await this.prisma.formField.update({
      where: { id: fieldId },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    // Create new form version
    await this.formsService.createNewFormVersion(formId);

    return { message: 'Field removed successfully' };
  }
}

