import { Module } from '@nestjs/common';
import { EntitiesService } from './entities.service';
import { EntitiesController } from './entities.controller';
import { PrismaService } from '../prisma/prisma.service';
import { FormsModule } from '../forms/forms.module';

@Module({
  imports: [FormsModule],
  controllers: [EntitiesController],
  providers: [EntitiesService, PrismaService],
})
export class EntitiesModule {}

