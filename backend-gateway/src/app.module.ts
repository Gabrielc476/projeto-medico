import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApplicationModule } from './application/application.module';
import { InfrastructureModule } from './infrastructure/infrastructure.module';
import { SymptomController } from './presentation/http/symptom.controller';
import { TriageController } from './presentation/http/triage.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    InfrastructureModule,
    ApplicationModule,
  ],
  controllers: [SymptomController, TriageController],
  providers: [],
})
export class AppModule {}
