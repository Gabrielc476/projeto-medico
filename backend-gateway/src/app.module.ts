import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApplicationModule } from './application/application.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { AuthModule } from './infrastructure/auth/auth.module';
import { SymptomController } from './presentation/http/symptom.controller';
import { TriageController } from './presentation/http/triage.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InfrastructureModule,
    ApplicationModule,
    AuthModule,
  ],

  controllers: [SymptomController, TriageController],
  providers: [],
})
export class AppModule {}
