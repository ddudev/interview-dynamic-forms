"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FormFieldsModule = void 0;
const common_1 = require("@nestjs/common");
const form_fields_service_1 = require("./form-fields.service");
const form_fields_controller_1 = require("./form-fields.controller");
const prisma_service_1 = require("../prisma/prisma.service");
const forms_module_1 = require("../forms/forms.module");
let FormFieldsModule = class FormFieldsModule {
};
exports.FormFieldsModule = FormFieldsModule;
exports.FormFieldsModule = FormFieldsModule = __decorate([
    (0, common_1.Module)({
        imports: [forms_module_1.FormsModule],
        controllers: [form_fields_controller_1.FormFieldsController],
        providers: [form_fields_service_1.FormFieldsService, prisma_service_1.PrismaService],
    })
], FormFieldsModule);
//# sourceMappingURL=form-fields.module.js.map