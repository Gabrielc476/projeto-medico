import { Module } from '@nestjs/common';
import { SyncSymptomDictionaryUseCase } from './use-cases/sync-symptom-dictionary.use-case';
import { ExtractContextUseCase } from './use-cases/extract-context.use-case';
import { ExtractExamUseCase } from './use-cases/extract-exam.use-case';
import { DiagnoseUseCase } from './use-cases/diagnose.use-case';
import { AddSymptomsUseCase } from './use-cases/add-symptoms.use-case';
import { InfrastructureModule } from '../infrastructure/infrastructure.module';

@Module({
  imports: [InfrastructureModule],
  providers: [SyncSymptomDictionaryUseCase, ExtractContextUseCase, ExtractExamUseCase, DiagnoseUseCase, AddSymptomsUseCase],
  exports: [SyncSymptomDictionaryUseCase, ExtractContextUseCase, ExtractExamUseCase, DiagnoseUseCase, AddSymptomsUseCase],
})
export class ApplicationModule {}

