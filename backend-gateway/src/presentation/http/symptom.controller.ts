import { Controller, Get, Post, HttpCode, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { SyncSymptomDictionaryUseCase } from '../../application/use-cases/sync-symptom-dictionary.use-case';
import { ISymptomCache } from '../../domain/ports/symptom-cache.port';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';

@ApiTags('Symptoms')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('symptoms')
export class SymptomController {
  constructor(
    private readonly syncUseCase: SyncSymptomDictionaryUseCase,
    private readonly cache: ISymptomCache,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos os sintomas sincronizados' })
  @ApiQuery({ name: 'region', required: false, description: 'Região do corpo para filtrar os sintomas (ex: head, chest, arms, legs, constitutional)' })
  @ApiResponse({ status: 200, description: 'Lista de sintomas' })
  async getSymptoms(@Query('region') region?: string) {
    if (region) {
      return await this.cache.getByRegion(region);
    }
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
