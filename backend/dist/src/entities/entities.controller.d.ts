import { EntitiesService } from './entities.service';
import { CreateEntityDto } from './dto/create-entity.dto';
export declare class EntitiesController {
    private readonly entitiesService;
    constructor(entitiesService: EntitiesService);
    create(createEntityDto: CreateEntityDto): Promise<any>;
    findAll(formId?: string, page?: number, limit?: number): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    }>;
    findOne(id: number): Promise<any>;
    getEntityForDisplay(id: number): Promise<{
        form_id: any;
        form_version: number;
        submitted_at: any;
        fields: any;
    }>;
}
