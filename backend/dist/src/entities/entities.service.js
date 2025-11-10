"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntitiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const forms_service_1 = require("../forms/forms.service");
let EntitiesService = class EntitiesService {
    prisma;
    formsService;
    constructor(prisma, formsService) {
        this.prisma = prisma;
        this.formsService = formsService;
    }
    async create(createEntityDto) {
        const form = await this.formsService.findOne(createEntityDto.formId);
        let formVersion = await this.prisma.formVersion.findFirst({
            where: { formId: form.id },
            orderBy: { versionNumber: 'desc' },
        });
        if (!formVersion) {
            const formDefinition = await this.formsService.buildFormDefinition(form.id);
            formVersion = await this.prisma.formVersion.create({
                data: {
                    formId: form.id,
                    versionNumber: 1,
                    formDefinition: formDefinition,
                },
            });
        }
        const entity = await this.prisma.entity.create({
            data: {
                formId: form.id,
                formVersionId: formVersion.id,
            },
        });
        const formDefinition = formVersion.formDefinition;
        const requiredFields = formDefinition.fields.filter((f) => f.required);
        for (const requiredField of requiredFields) {
            if (!createEntityDto.values.hasOwnProperty(requiredField.field_name) ||
                createEntityDto.values[requiredField.field_name] === null ||
                createEntityDto.values[requiredField.field_name] === undefined ||
                createEntityDto.values[requiredField.field_name] === '') {
                throw new common_1.BadRequestException(`Required field ${requiredField.field_name} is missing`);
            }
        }
        for (const [fieldName, value] of Object.entries(createEntityDto.values)) {
            const fieldDef = formDefinition.fields.find((f) => f.field_name === fieldName);
            if (!fieldDef) {
                throw new common_1.BadRequestException(`Field ${fieldName} not found in form definition`);
            }
            const formField = await this.prisma.formField.findUnique({
                where: { id: fieldDef.id },
            });
            if (!formField) {
                throw new common_1.NotFoundException(`Form field ${fieldDef.id} not found`);
            }
            if (fieldDef.required && (value === null || value === undefined || value === '')) {
                throw new common_1.BadRequestException(`Field ${fieldName} is required`);
            }
            if (value !== null && value !== undefined && value !== '') {
                if (fieldDef.field_type === 'number' && isNaN(Number(value))) {
                    throw new common_1.BadRequestException(`Field ${fieldName} must be a valid number`);
                }
                if (fieldDef.field_type === 'email') {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    if (!emailRegex.test(String(value))) {
                        throw new common_1.BadRequestException(`Field ${fieldName} must be a valid email address`);
                    }
                }
                if (fieldDef.field_type === 'date') {
                    const date = new Date(String(value));
                    if (isNaN(date.getTime())) {
                        throw new common_1.BadRequestException(`Field ${fieldName} must be a valid date`);
                    }
                }
                if (fieldDef.field_type === 'select' &&
                    fieldDef.options &&
                    fieldDef.options.options) {
                    if (!fieldDef.options.options.includes(String(value))) {
                        throw new common_1.BadRequestException(`Field ${fieldName} must be one of the allowed options`);
                    }
                }
            }
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
    async findAll(formId, page = 1, limit = 10) {
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
        const entitiesWithData = await Promise.all(entities.map(async (entity) => {
            return this.buildEntityResponse(entity);
        }));
        return {
            data: entitiesWithData,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
    async findOne(id) {
        const entity = await this.prisma.entity.findUnique({
            where: { id },
            include: {
                form: true,
                formVersion: true,
            },
        });
        if (!entity) {
            throw new common_1.NotFoundException(`Entity with ID ${id} not found`);
        }
        return this.buildEntityResponse(entity);
    }
    async buildEntityResponse(entity) {
        const values = await this.prisma.entityValue.findMany({
            where: { entityId: entity.id },
        });
        const formDefinition = entity.formVersion.formDefinition;
        const result = {
            id: entity.id,
            form_id: entity.formId,
            form_version: entity.formVersion.versionNumber,
            created_at: entity.createdAt,
            updated_at: entity.updatedAt,
        };
        if (formDefinition.fields) {
            for (const fieldDef of formDefinition.fields) {
                const valueRecord = values.find((v) => v.formFieldId === fieldDef.id);
                result[fieldDef.field_name] = valueRecord ? valueRecord.value : null;
            }
        }
        return result;
    }
    async getEntityForDisplay(id) {
        const entity = await this.findOne(id);
        const formVersion = await this.prisma.formVersion.findUnique({
            where: { id: entity.form_version },
        });
        if (!formVersion) {
            throw new common_1.NotFoundException('Form version not found');
        }
        const values = await this.prisma.entityValue.findMany({
            where: { entityId: id },
        });
        const formDefinition = formVersion.formDefinition;
        return {
            form_id: entity.form_id,
            form_version: formVersion.versionNumber,
            submitted_at: entity.created_at,
            fields: formDefinition.fields.map((fieldDef) => {
                const valueRecord = values.find((v) => v.formFieldId === fieldDef.id);
                return {
                    ...fieldDef,
                    value: valueRecord ? valueRecord.value : null,
                    label: valueRecord ? valueRecord.fieldLabel : fieldDef.label,
                    type: valueRecord ? valueRecord.fieldType : fieldDef.field_type,
                    options: valueRecord?.fieldOptions || fieldDef.options,
                };
            }),
        };
    }
};
exports.EntitiesService = EntitiesService;
exports.EntitiesService = EntitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        forms_service_1.FormsService])
], EntitiesService);
//# sourceMappingURL=entities.service.js.map