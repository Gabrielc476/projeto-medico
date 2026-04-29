import { Controller, Get, Post, HttpCode } from '@nestjs/common';
import { SyncSymptomDictionaryUseCase } from '../../application/use-cases/sync-symptom-dictionary.use-case';
import { ISymptomCache } from '../../domain/ports/symptom-cache.port';

@Controller('symptoms')
export class SymptomController {
  constructor(
    private readonly syncUseCase: SyncSymptomDictionaryUseCase,
    private readonly cache: ISymptomCache,
  ) {}

  @Get()
  async getSymptoms() {
    return await this.cache.getAll();
  }

  @Post('sync')
  @HttpCode(200)
  async sync() {
    await this.syncUseCase.execute();
    return { message: 'Synchronization started' };
  }
}
