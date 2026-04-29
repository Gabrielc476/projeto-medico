import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SyncSymptomDictionaryUseCase } from './sync-symptom-dictionary.use-case';
import { IDiagnosticClient } from '../../domain/ports/diagnostic-client.port';
import { ISymptomCache } from '../../domain/ports/symptom-cache.port';
import { of } from 'rxjs';

describe('SyncSymptomDictionaryUseCase', () => {
  let useCase: SyncSymptomDictionaryUseCase;
  let mockDiagnosticClient: IDiagnosticClient;
  let mockCache: ISymptomCache;

  beforeEach(() => {
    mockDiagnosticClient = {
      getAppSymptoms: vi.fn(),
    } as any;

    mockCache = {
      set: vi.fn(),
    } as any;

    useCase = new SyncSymptomDictionaryUseCase(mockDiagnosticClient, mockCache);
  });

  it('should sync symptoms from diagnostic client to cache', async () => {
    const mockResponse = {
      symptoms: [
        { cui: 'C01', clinicalName: 'Fever', laymanTerm: 'Febre' },
        { cui: 'C02', clinicalName: 'Cough', laymanTerm: 'Tosse' },
      ],
    };

    vi.mocked(mockDiagnosticClient.getAppSymptoms).mockReturnValue(of(mockResponse));

    await useCase.execute();

    expect(mockDiagnosticClient.getAppSymptoms).toHaveBeenCalled();
    expect(mockCache.set).toHaveBeenCalledTimes(2);
    expect(mockCache.set).toHaveBeenCalledWith('C01', expect.objectContaining({ laymanTerm: 'Febre' }));
  });

  it('should handle empty symptoms list', async () => {
    vi.mocked(mockDiagnosticClient.getAppSymptoms).mockReturnValue(of({ symptoms: [] }));

    await useCase.execute();

    expect(mockCache.set).not.toHaveBeenCalled();
  });
});
