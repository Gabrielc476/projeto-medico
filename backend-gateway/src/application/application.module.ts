import { Module } from '@nestjs/common';
import { SyncSymptomDictionaryUseCase } from './use-cases/sync-symptom-dictionary.use-case';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  providers: [SyncSymptomDictionaryUseCase],
  exports: [SyncSymptomDictionaryUseCase],
})
export class ApplicationModule {}
