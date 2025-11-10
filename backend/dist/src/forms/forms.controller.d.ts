import { FormsService } from './forms.service';
import { CreateFormDto, UpdateFormDto } from './dto/create-form.dto';
export declare class FormsController {
    private readonly formsService;
    constructor(formsService: FormsService);
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
    getVersions(id: number): Promise<{
        createdAt: Date;
        id: number;
        formId: number;
        versionNumber: number;
        formDefinition: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
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
}
