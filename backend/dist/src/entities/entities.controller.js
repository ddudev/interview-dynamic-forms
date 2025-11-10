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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntitiesController = void 0;
const common_1 = require("@nestjs/common");
const entities_service_1 = require("./entities.service");
const create_entity_dto_1 = require("./dto/create-entity.dto");
let EntitiesController = class EntitiesController {
    entitiesService;
    constructor(entitiesService) {
        this.entitiesService = entitiesService;
    }
    create(createEntityDto) {
        return this.entitiesService.create(createEntityDto);
    }
    findAll(formId, page, limit) {
        return this.entitiesService.findAll(formId ? parseInt(formId) : undefined, page, limit);
    }
    findOne(id) {
        return this.entitiesService.findOne(id);
    }
    getEntityForDisplay(id) {
        return this.entitiesService.getEntityForDisplay(id);
    }
};
exports.EntitiesController = EntitiesController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_entity_dto_1.CreateEntityDto]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('formId')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)(':id/display'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], EntitiesController.prototype, "getEntityForDisplay", null);
exports.EntitiesController = EntitiesController = __decorate([
    (0, common_1.Controller)('entities'),
    __metadata("design:paramtypes", [entities_service_1.EntitiesService])
], EntitiesController);
//# sourceMappingURL=entities.controller.js.map