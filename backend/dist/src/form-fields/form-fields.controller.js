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
exports.FormFieldsController = void 0;
const common_1 = require("@nestjs/common");
const form_fields_service_1 = require("./form-fields.service");
const create_form_field_dto_1 = require("./dto/create-form-field.dto");
let FormFieldsController = class FormFieldsController {
    formFieldsService;
    constructor(formFieldsService) {
        this.formFieldsService = formFieldsService;
    }
    create(formId, createFormFieldDto) {
        return this.formFieldsService.create(formId, createFormFieldDto);
    }
    findAll(formId) {
        return this.formFieldsService.findAll(formId);
    }
    findOne(formId, fieldId) {
        return this.formFieldsService.findOne(formId, fieldId);
    }
    update(formId, fieldId, updateFormFieldDto) {
        return this.formFieldsService.update(formId, fieldId, updateFormFieldDto);
    }
    remove(formId, fieldId) {
        return this.formFieldsService.remove(formId, fieldId);
    }
};
exports.FormFieldsController = FormFieldsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Param)('formId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, create_form_field_dto_1.CreateFormFieldDto]),
    __metadata("design:returntype", void 0)
], FormFieldsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Param)('formId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], FormFieldsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':fieldId'),
    __param(0, (0, common_1.Param)('formId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('fieldId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], FormFieldsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Patch)(':fieldId'),
    __param(0, (0, common_1.Param)('formId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('fieldId', common_1.ParseIntPipe)),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, create_form_field_dto_1.UpdateFormFieldDto]),
    __metadata("design:returntype", void 0)
], FormFieldsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':fieldId'),
    __param(0, (0, common_1.Param)('formId', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Param)('fieldId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", void 0)
], FormFieldsController.prototype, "remove", null);
exports.FormFieldsController = FormFieldsController = __decorate([
    (0, common_1.Controller)('forms/:formId/fields'),
    __metadata("design:paramtypes", [form_fields_service_1.FormFieldsService])
], FormFieldsController);
//# sourceMappingURL=form-fields.controller.js.map