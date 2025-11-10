import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { FormFieldsService } from './form-fields.service';
import {
  CreateFormFieldDto,
  UpdateFormFieldDto,
} from './dto/create-form-field.dto';

@Controller('forms/:formId/fields')
export class FormFieldsController {
  constructor(private readonly formFieldsService: FormFieldsService) {}

  @Post()
  create(
    @Param('formId', ParseIntPipe) formId: number,
    @Body() createFormFieldDto: CreateFormFieldDto,
  ) {
    return this.formFieldsService.create(formId, createFormFieldDto);
  }

  @Get()
  findAll(@Param('formId', ParseIntPipe) formId: number) {
    return this.formFieldsService.findAll(formId);
  }

  @Get(':fieldId')
  findOne(
    @Param('formId', ParseIntPipe) formId: number,
    @Param('fieldId', ParseIntPipe) fieldId: number,
  ) {
    return this.formFieldsService.findOne(formId, fieldId);
  }

  @Patch(':fieldId')
  update(
    @Param('formId', ParseIntPipe) formId: number,
    @Param('fieldId', ParseIntPipe) fieldId: number,
    @Body() updateFormFieldDto: UpdateFormFieldDto,
  ) {
    return this.formFieldsService.update(formId, fieldId, updateFormFieldDto);
  }

  @Delete(':fieldId')
  remove(
    @Param('formId', ParseIntPipe) formId: number,
    @Param('fieldId', ParseIntPipe) fieldId: number,
  ) {
    return this.formFieldsService.remove(formId, fieldId);
  }
}

