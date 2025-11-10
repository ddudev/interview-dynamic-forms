import { PrismaService } from '../prisma/prisma.service';
import { FormsService } from '../forms/forms.service';
import { CreateFormFieldDto, UpdateFormFieldDto } from './dto/create-form-field.dto';
export declare class FormFieldsService {
    private prisma;
    private formsService;
    constructor(prisma: PrismaService, formsService: FormsService);
    create(formId: number, createFormFieldDto: CreateFormFieldDto): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        formId: number;
        fieldName: string;
        fieldType: string;
        label: string;
        required: boolean;
        options: import("@prisma/client/runtime/library").JsonValue | null;
        errorMessages: import("@prisma/client/runtime/library").JsonValue | null;
        displayOrder: number;
        isActive: boolean;
        version: number;
        replacedByFieldId: number | null;
    }>;
    findAll(formId: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        formId: number;
        fieldName: string;
        fieldType: string;
        label: string;
        required: boolean;
        options: import("@prisma/client/runtime/library").JsonValue | null;
        errorMessages: import("@prisma/client/runtime/library").JsonValue | null;
        displayOrder: number;
        isActive: boolean;
        version: number;
        replacedByFieldId: number | null;
    }[]>;
    findOne(formId: number, fieldId: number): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        formId: number;
        fieldName: string;
        fieldType: string;
        label: string;
        required: boolean;
        options: import("@prisma/client/runtime/library").JsonValue | null;
        errorMessages: import("@prisma/client/runtime/library").JsonValue | null;
        displayOrder: number;
        isActive: boolean;
        version: number;
        replacedByFieldId: number | null;
    }>;
    update(formId: number, fieldId: number, updateFormFieldDto: UpdateFormFieldDto): Promise<{
        createdAt: Date;
        updatedAt: Date;
        id: number;
        formId: number;
        fieldName: string;
        fieldType: string;
        label: string;
        required: boolean;
        options: import("@prisma/client/runtime/library").JsonValue | null;
        errorMessages: import("@prisma/client/runtime/library").JsonValue | null;
        displayOrder: number;
        isActive: boolean;
        version: number;
        replacedByFieldId: number | null;
    }>;
    remove(formId: number, fieldId: number): Promise<{
        message: string;
    }>;
}
