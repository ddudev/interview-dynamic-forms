import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { FormsModule } from './forms/forms.module';
import { FormFieldsModule } from './form-fields/form-fields.module';
import { EntitiesModule } from './entities/entities.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AuthModule,
    FormsModule,
    FormFieldsModule,
    EntitiesModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
