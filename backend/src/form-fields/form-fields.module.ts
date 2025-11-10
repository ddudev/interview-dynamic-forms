import { Module } from '@nestjs/common';
import { FormFieldsService } from './form-fields.service';
import { FormFieldsController } from './form-fields.controller';
import { PrismaService } from '../prisma/prisma.service';
import { FormsModule } from '../forms/forms.module';

@Module({
  imports: [FormsModule],
  controllers: [FormFieldsController],
  providers: [FormFieldsService, PrismaService],
})
export class FormFieldsModule {}

