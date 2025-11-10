import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateFormDto, UpdateFormDto } from './dto/create-form.dto';

@Injectable()
export class FormsService {
  constructor(private prisma: PrismaService) {}

  async create(createFormDto: CreateFormDto) {
    const form = await this.prisma.form.create({
      data: {
        name: createFormDto.name,
        entityType: createFormDto.entityType,
      },
    });

    // Create initial form version
    const formDefinition = await this.buildFormDefinition(form.id);
    await this.prisma.formVersion.create({
      data: {
        formId: form.id,
        versionNumber: 1,
        formDefinition: formDefinition,
      },
    });

    return form;
  }

  async findAll() {
    return this.prisma.form.findMany({
      include: {
        fields: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
        _count: {
          select: {
            entities: true,
          },
        },
      },
    });
  }

  async findOne(id: number) {
    const form = await this.prisma.form.findUnique({
      where: { id },
      include: {
        fields: {
          where: { isActive: true },
          orderBy: { displayOrder: 'asc' },
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 1,
        },
      },
    });

    if (!form) {
      throw new NotFoundException(`Form with ID ${id} not found`);
    }

    return form;
  }

  async update(id: number, updateFormDto: UpdateFormDto) {
    const form = await this.findOne(id);

    return this.prisma.form.update({
      where: { id },
      data: updateFormDto,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.form.delete({
      where: { id },
    });
  }

  async getFormVersions(formId: number) {
    await this.findOne(formId);
    return this.prisma.formVersion.findMany({
      where: { formId },
      orderBy: { versionNumber: 'desc' },
    });
  }

  async buildFormDefinition(formId: number) {
    const fields = await this.prisma.formField.findMany({
      where: {
        formId,
        isActive: true,
      },
      orderBy: {
        displayOrder: 'asc',
      },
    });

    return {
      fields: fields.map((f) => ({
        id: f.id,
        field_name: f.fieldName,
        field_type: f.fieldType,
        label: f.label,
        required: f.required,
        options: f.options,
        error_messages: f.errorMessages,
        display_order: f.displayOrder,
      })),
    };
  }

  async createNewFormVersion(formId: number) {
    const form = await this.findOne(formId);
    const latestVersion = await this.prisma.formVersion.findFirst({
      where: { formId },
      orderBy: { versionNumber: 'desc' },
    });

    const newVersionNumber = latestVersion
      ? latestVersion.versionNumber + 1
      : 1;

    const formDefinition = await this.buildFormDefinition(formId);

    return this.prisma.formVersion.create({
      data: {
        formId,
        versionNumber: newVersionNumber,
        formDefinition: formDefinition,
      },
    });
  }
}

