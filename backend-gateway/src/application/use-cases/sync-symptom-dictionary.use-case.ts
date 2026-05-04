import { Injectable, Logger } from '@nestjs/common';
import { IDiagnosticClient } from '../../domain/ports/diagnostic-client.port';
import { ISymptomCache } from '../../domain/ports/symptom-cache.port';
import { firstValueFrom } from 'rxjs';
import { type AppSymptomResponse } from '../../domain/types/diagnostic';

@Injectable()
export class SyncSymptomDictionaryUseCase {
  private readonly logger = new Logger(SyncSymptomDictionaryUseCase.name);

  constructor(
    private readonly diagnosticClient: IDiagnosticClient,
    private readonly cache: ISymptomCache,
  ) {}

  async execute(): Promise<void> {
    try {
      this.logger.log('Starting symptom dictionary synchronization...');
      
      // Call GetAppSymptoms via port
      const response: AppSymptomResponse = await firstValueFrom(this.diagnosticClient.getAppSymptoms('pt-BR'));
      
      if (response && response.symptoms) {
        for (const symptom of response.symptoms) {
          await this.cache.set(symptom.cui, {
            cui: symptom.cui,
            clinicalName: symptom.clinical_name,
            laymanTerm: symptom.layman_term,
          });
        }
        this.logger.log(`Synchronized ${response.symptoms.length} symptoms.`);
      }
    } catch (error) {
      this.logger.error('Failed to sync symptom dictionary', error);
      throw error;
    }
  }
}
