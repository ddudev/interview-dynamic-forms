import { PrismaService } from '../prisma/prisma.service';
import { FormsService } from '../forms/forms.service';
import { CreateEntityDto } from './dto/create-entity.dto';
export declare class EntitiesService {
    private prisma;
    private formsService;
    constructor(prisma: PrismaService, formsService: FormsService);
    create(createEntityDto: CreateEntityDto): Promise<any>;
    findAll(formId?: number, page?: number, limit?: number): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<any>;
    buildEntityResponse(entity: any): Promise<any>;
    getEntityForDisplay(id: number): Promise<{
        form_id: any;
        form_version: number;
        submitted_at: any;
        fields: any;
    }>;
}
