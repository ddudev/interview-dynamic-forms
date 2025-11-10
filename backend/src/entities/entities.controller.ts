import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Query,
  DefaultValuePipe,
} from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { CreateEntityDto } from './dto/create-entity.dto';

@Controller('entities')
export class EntitiesController {
  constructor(private readonly entitiesService: EntitiesService) {}

  @Post()
  create(@Body() createEntityDto: CreateEntityDto) {
    return this.entitiesService.create(createEntityDto);
  }

  @Get()
  findAll(
    @Query('formId') formId?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page?: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit?: number,
  ) {
    return this.entitiesService.findAll(
      formId ? parseInt(formId) : undefined,
      page,
      limit,
    );
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.entitiesService.findOne(id);
  }

  @Get(':id/display')
  getEntityForDisplay(@Param('id', ParseIntPipe) id: number) {
    return this.entitiesService.getEntityForDisplay(id);
  }
}

