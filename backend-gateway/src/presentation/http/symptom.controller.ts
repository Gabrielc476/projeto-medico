import { Controller, Get, Post, HttpCode } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SyncSymptomDictionaryUseCase } from '../../application/use-cases/sync-symptom-dictionary.use-case';
import { ISymptomCache } from '../../domain/ports/symptom-cache.port';

@ApiTags('Symptoms')
@Controller('symptoms')
export class SymptomController {
  constructor(
    private readonly syncUseCase: SyncSymptomDictionaryUseCase,
    private readonly cache: ISymptomCache,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os sintomas sincronizados' })
  @ApiResponse({ status: 200, description: 'Lista de sintomas' })
  async getSymptoms() {
    return await this.cache.getAll();
  }

  @Post('sync')
  @HttpCode(200)
  @ApiOperation({ summary: 'Sincronizar dicionário de sintomas com o motor Python' })
  @ApiResponse({ status: 200, description: 'Sincronização iniciada' })
  async sync() {
    await this.syncUseCase.execute();
    return { message: 'Synchronization started' };
  }
}

