import { PrismaService } from '../prisma/prisma.service';
import { CreateFormDto, UpdateFormDto } from './dto/create-form.dto';
export declare class FormsService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createFormDto: CreateFormDto): Promise<{
        name: string;
        entityType: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    findAll(): Promise<({
        fields: {
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
        }[];
        _count: {
            entities: number;
        };
    } & {
        name: string;
        entityType: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    })[]>;
    findOne(id: number): Promise<{
        fields: {
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
        }[];
        versions: {
            createdAt: Date;
            id: number;
            formId: number;
            versionNumber: number;
            formDefinition: import("@prisma/client/runtime/library").JsonValue;
        }[];
    } & {
        name: string;
        entityType: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    update(id: number, updateFormDto: UpdateFormDto): Promise<{
        name: string;
        entityType: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    remove(id: number): Promise<{
        name: string;
        entityType: string;
        createdAt: Date;
        updatedAt: Date;
        id: number;
    }>;
    getFormVersions(formId: number): Promise<{
        createdAt: Date;
        id: number;
        formId: number;
        versionNumber: number;
        formDefinition: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
    buildFormDefinition(formId: number): Promise<{
        fields: {
            id: number;
            field_name: string;
            field_type: string;
            label: string;
            required: boolean;
            options: import("@prisma/client/runtime/library").JsonValue;
            error_messages: import("@prisma/client/runtime/library").JsonValue;
            display_order: number;
        }[];
    }>;
    createNewFormVersion(formId: number): Promise<{
        createdAt: Date;
        id: number;
        formId: number;
        versionNumber: number;
        formDefinition: import("@prisma/client/runtime/library").JsonValue;
    }>;
}
