import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApplicationModule } from './application/application.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { SymptomController } from './presentation/http/symptom.controller';
import { TriageController } from './presentation/http/triage.controller';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { AuditLogInterceptor } from './presentation/interceptors/audit-log.interceptor';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InfrastructureModule,
    ApplicationModule,
    AuthModule,
  ],

  controllers: [SymptomController, TriageController],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: AuditLogInterceptor,
    },
  ],

})
export class AppModule {}
