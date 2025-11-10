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
exports.FormsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let FormsService = class FormsService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createFormDto) {
        const form = await this.prisma.form.create({
            data: {
                name: createFormDto.name,
                entityType: createFormDto.entityType,
            },
        });
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
    async findOne(id) {
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
            throw new common_1.NotFoundException(`Form with ID ${id} not found`);
        }
        return form;
    }
    async update(id, updateFormDto) {
        const form = await this.findOne(id);
        return this.prisma.form.update({
            where: { id },
            data: updateFormDto,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.form.delete({
            where: { id },
        });
    }
    async getFormVersions(formId) {
        await this.findOne(formId);
        return this.prisma.formVersion.findMany({
            where: { formId },
            orderBy: { versionNumber: 'desc' },
        });
    }
    async buildFormDefinition(formId) {
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
    async createNewFormVersion(formId) {
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
};
exports.FormsService = FormsService;
exports.FormsService = FormsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], FormsService);
//# sourceMappingURL=forms.service.js.map