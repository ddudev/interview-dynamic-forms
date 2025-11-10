"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EntitiesModule = void 0;
const common_1 = require("@nestjs/common");
const entities_service_1 = require("./entities.service");
const entities_controller_1 = require("./entities.controller");
const prisma_service_1 = require("../prisma/prisma.service");
const forms_module_1 = require("../forms/forms.module");
let EntitiesModule = class EntitiesModule {
};
exports.EntitiesModule = EntitiesModule;
exports.EntitiesModule = EntitiesModule = __decorate([
    (0, common_1.Module)({
        imports: [forms_module_1.FormsModule],
        controllers: [entities_controller_1.EntitiesController],
        providers: [entities_service_1.EntitiesService, prisma_service_1.PrismaService],
    })
], EntitiesModule);
//# sourceMappingURL=entities.module.js.map