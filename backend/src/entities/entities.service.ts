import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FormsService } from '../forms/forms.service';
import { CreateEntityDto } from './dto/create-entity.dto';

@Injectable()
export class EntitiesService {
  constructor(
    private prisma: PrismaService,
    private formsService: FormsService,
  ) {}

  async create(createEntityDto: CreateEntityDto) {
    const form = await this.formsService.findOne(createEntityDto.formId);

    // Get current form version (or create one if doesn't exist)
    let formVersion = await this.prisma.formVersion.findFirst({
      where: { formId: form.id },
      orderBy: { versionNumber: 'desc' },
    });

    if (!formVersion) {
      const formDefinition = await this.formsService.buildFormDefinition(
        form.id,
      );
      formVersion = await this.prisma.formVersion.create({
        data: {
          formId: form.id,
          versionNumber: 1,
          formDefinition: formDefinition,
        },
      });
    }

    // Create entity with form version reference
    const entity = await this.prisma.entity.create({
      data: {
        formId: form.id,
        formVersionId: formVersion.id,
      },
    });

    // Store values with complete field context
    const formDefinition = formVersion.formDefinition as any;

    // Validate all required fields are present
    const requiredFields = formDefinition.fields.filter(
      (f: any) => f.required,
    );
    for (const requiredField of requiredFields) {
      if (
        !createEntityDto.values.hasOwnProperty(requiredField.field_name) ||
        createEntityDto.values[requiredField.field_name] === null ||
        createEntityDto.values[requiredField.field_name] === undefined ||
        createEntityDto.values[requiredField.field_name] === ''
      ) {
        throw new BadRequestException(
          `Required field ${requiredField.field_name} is missing`,
        );
      }
    }

    for (const [fieldName, value] of Object.entries(createEntityDto.values)) {
      const fieldDef = formDefinition.fields.find(
        (f: any) => f.field_name === fieldName,
      );

      if (!fieldDef) {
        throw new BadRequestException(
          `Field ${fieldName} not found in form definition`,
        );
      }

      // Get the actual form_field record
      const formField = await this.prisma.formField.findUnique({
        where: { id: fieldDef.id },
      });

      if (!formField) {
        throw new NotFoundException(`Form field ${fieldDef.id} not found`);
      }

      // Validate required fields
      if (fieldDef.required && (value === null || value === undefined || value === '')) {
        throw new BadRequestException(`Field ${fieldName} is required`);
      }

      // Validate value type matches field type
      if (value !== null && value !== undefined && value !== '') {
        if (fieldDef.field_type === 'number' && isNaN(Number(value))) {
          throw new BadRequestException(
            `Field ${fieldName} must be a valid number`,
          );
        }
        if (fieldDef.field_type === 'email') {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(String(value))) {
            throw new BadRequestException(
              `Field ${fieldName} must be a valid email address`,
            );
          }
        }
        if (fieldDef.field_type === 'date') {
          const date = new Date(String(value));
          if (isNaN(date.getTime())) {
            throw new BadRequestException(
              `Field ${fieldName} must be a valid date`,
            );
          }
        }
        if (
          fieldDef.field_type === 'select' &&
          fieldDef.options &&
          fieldDef.options.options
        ) {
          if (!fieldDef.options.options.includes(String(value))) {
            throw new BadRequestException(
              `Field ${fieldName} must be one of the allowed options`,
            );
          }
        }
      }

      // Store with all historical context
      await this.prisma.entityValue.create({
        data: {
          entityId: entity.id,
          formFieldId: formField.id,
          fieldName: fieldDef.field_name,
          fieldLabel: fieldDef.label,
          fieldType: fieldDef.field_type,
          fieldOptions: fieldDef.options || null,
          value: String(value),
        },
      });
    }

    return this.findOne(entity.id);
  }

  async findAll(formId?: number, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const where = formId ? { formId } : {};

    const [entities, total] = await Promise.all([
      this.prisma.entity.findMany({
        where,
        include: {
          formVersion: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.entity.count({ where }),
    ]);

    // For each entity, get its values and build response
    const entitiesWithData = await Promise.all(
      entities.map(async (entity) => {
        return this.buildEntityResponse(entity);
      }),
    );

    return {
      data: entitiesWithData,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const entity = await this.prisma.entity.findUnique({
      where: { id },
      include: {
        form: true,
        formVersion: true,
      },
    });

    if (!entity) {
      throw new NotFoundException(`Entity with ID ${id} not found`);
    }

    return this.buildEntityResponse(entity);
  }

  async buildEntityResponse(entity: any) {
    // Get all values stored with this entity
    const values = await this.prisma.entityValue.findMany({
      where: { entityId: entity.id },
    });

    // Build response using historical field definitions
    const formDefinition = entity.formVersion.formDefinition as any;

    const result: any = {
      id: entity.id,
      form_id: entity.formId,
      form_version: entity.formVersion.versionNumber,
      created_at: entity.createdAt,
      updated_at: entity.updatedAt,
    };

    // Use stored values, preserving original field order and definitions
    if (formDefinition.fields) {
      for (const fieldDef of formDefinition.fields) {
        const valueRecord = values.find(
          (v) => v.formFieldId === fieldDef.id,
        );
        result[fieldDef.field_name] = valueRecord ? valueRecord.value : null;
      }
    }

    return result;
  }

  async getEntityForDisplay(id: number) {
    const entity = await this.findOne(id);
    const formVersion = await this.prisma.formVersion.findUnique({
      where: { id: entity.form_version },
    });

    if (!formVersion) {
      throw new NotFoundException('Form version not found');
    }

    // Get all values
    const values = await this.prisma.entityValue.findMany({
      where: { entityId: id },
    });

    // Reconstruct form as it was at submission time
    const formDefinition = formVersion.formDefinition as any;

    return {
      form_id: entity.form_id,
      form_version: formVersion.versionNumber,
      submitted_at: entity.created_at,
      fields: formDefinition.fields.map((fieldDef: any) => {
        const valueRecord = values.find((v) => v.formFieldId === fieldDef.id);
        return {
          ...fieldDef,
          value: valueRecord ? valueRecord.value : null,
          // Use stored historical field metadata
          label: valueRecord ? valueRecord.fieldLabel : fieldDef.label,
          type: valueRecord ? valueRecord.fieldType : fieldDef.field_type,
          options: valueRecord?.fieldOptions || fieldDef.options,
        };
      }),
    };
  }
}

