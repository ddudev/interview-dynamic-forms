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
exports.FormFieldsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const forms_service_1 = require("../forms/forms.service");
let FormFieldsService = class FormFieldsService {
    prisma;
    formsService;
    constructor(prisma, formsService) {
        this.prisma = prisma;
        this.formsService = formsService;
    }
    async create(formId, createFormFieldDto) {
        await this.formsService.findOne(formId);
        const existingField = await this.prisma.formField.findFirst({
            where: {
                formId,
                fieldName: createFormFieldDto.fieldName,
                isActive: true,
            },
        });
        if (existingField) {
            throw new common_1.BadRequestException(`Field with name ${createFormFieldDto.fieldName} already exists`);
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
        await this.formsService.createNewFormVersion(formId);
        return field;
    }
    async findAll(formId) {
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
    async findOne(formId, fieldId) {
        await this.formsService.findOne(formId);
        const field = await this.prisma.formField.findFirst({
            where: {
                id: fieldId,
                formId,
            },
        });
        if (!field) {
            throw new common_1.NotFoundException(`Field with ID ${fieldId} not found in form ${formId}`);
        }
        return field;
    }
    async update(formId, fieldId, updateFormFieldDto) {
        const oldField = await this.findOne(formId, fieldId);
        if (!oldField.isActive) {
            throw new common_1.BadRequestException('Cannot update inactive field');
        }
        const errorMessagesValue = updateFormFieldDto.errorMessages ??
            (oldField.errorMessages ? oldField.errorMessages : undefined);
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
        await this.prisma.formField.update({
            where: { id: oldField.id },
            data: {
                isActive: false,
                replacedByFieldId: newField.id,
            },
        });
        await this.formsService.createNewFormVersion(formId);
        return newField;
    }
    async remove(formId, fieldId) {
        const field = await this.findOne(formId, fieldId);
        if (!field.isActive) {
            throw new common_1.BadRequestException('Field is already inactive');
        }
        await this.prisma.formField.update({
            where: { id: fieldId },
            data: {
                isActive: false,
                updatedAt: new Date(),
            },
        });
        await this.formsService.createNewFormVersion(formId);
        return { message: 'Field removed successfully' };
    }
};
exports.FormFieldsService = FormFieldsService;
exports.FormFieldsService = FormFieldsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        forms_service_1.FormsService])
], FormFieldsService);
//# sourceMappingURL=form-fields.service.js.map