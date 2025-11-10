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
import { FormsService } from './forms.service';
import { CreateFormDto, UpdateFormDto } from './dto/create-form.dto';

@Controller('forms')
export class FormsController {
  constructor(private readonly formsService: FormsService) {}

  @Post()
  create(@Body() createFormDto: CreateFormDto) {
    return this.formsService.create(createFormDto);
  }

  @Get()
  findAll() {
    return this.formsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.formsService.findOne(id);
  }

  @Get(':id/versions')
  getVersions(@Param('id', ParseIntPipe) id: number) {
    return this.formsService.getFormVersions(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateFormDto: UpdateFormDto,
  ) {
    return this.formsService.update(id, updateFormDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.formsService.remove(id);
  }
}

