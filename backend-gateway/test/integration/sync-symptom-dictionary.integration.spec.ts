import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { SyncSymptomDictionaryUseCase } from '../../src/application/use-cases/sync-symptom-dictionary.use-case';
import { InfrastructureModule } from '../../src/infrastructure/infrastructure.module';
import { ConfigModule } from '@nestjs/config';
import { ISymptomCache } from '../../src/domain/ports/symptom-cache.port';
import { IDiagnosticClient } from '../../src/domain/ports/diagnostic-client.port';
import { firstValueFrom } from 'rxjs';

describe('SyncSymptomDictionaryUseCase (Integration)', () => {
  let useCase: SyncSymptomDictionaryUseCase;
  let cache: ISymptomCache;
  let diagnosticClient: IDiagnosticClient;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [() => ({ DIAGNOSTIC_ENGINE_URL: 'diagnostic-engine:50051' })],
        }),
        InfrastructureModule,
      ],
      providers: [SyncSymptomDictionaryUseCase],
    }).compile();

    useCase = module.get<SyncSymptomDictionaryUseCase>(SyncSymptomDictionaryUseCase);
    cache = module.get<ISymptomCache>(ISymptomCache);
    diagnosticClient = module.get<IDiagnosticClient>(IDiagnosticClient);
    
    await module.init();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should sync symptoms from diagnostic-engine gRPC and persist in cache', async () => {
    console.log('--- Starting Integration Test: SyncSymptomDictionaryUseCase ---');
    
    // 1. Clear cache before starting
    await cache.clear();

    // 2. Execute sync
    await useCase.execute();

    // 3. Fetch symptoms directly to verify and log
    const response = await firstValueFrom(diagnosticClient.getAppSymptoms('pt-BR'));
    
    expect(response).toBeDefined();
    expect(response.symptoms).toBeDefined();
    expect(response.symptoms.length).toBeGreaterThan(0);

    console.log(`\nSuccessfully synchronized ${response.symptoms.length} symptoms.`);
    console.log('--- Sample of 10 Symptoms (Clinical -> Layman) ---');

    const sample = response.symptoms.slice(0, 10);
    for (const symptom of sample) {
      // Validate snake_case fields are present (keepCase: true)
      expect(symptom.clinical_name).toBeDefined();
      expect(symptom.layman_term).toBeDefined();

      console.log(`[${symptom.cui}] ${symptom.clinical_name.padEnd(30)} -> ${symptom.layman_term}`);
      
      // Verify persistence in cache
      const cached = await cache.get(symptom.cui);
      expect(cached).toBeDefined();
      expect(cached?.clinicalName).toBe(symptom.clinical_name);
      expect(cached?.laymanTerm).toBe(symptom.layman_term);
    }

    console.log('------------------------------------------------------------\n');
  }, 120000); // 120s timeout for LLM-powered gRPC call
});
