import { Controller, Post, Body, Get, Param, Inject, UseGuards, Request } from '@nestjs/common';
import { IDiagnosticClient } from '../../domain/ports/diagnostic-client.port';
import { ITriageRepository } from '../../domain/ports/triage-repository.port';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { StartTriageDto, DiagnoseTriageDto } from './dtos/triage.dto';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('Triage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('triage')
export class TriageController {
  constructor(
    @Inject(IDiagnosticClient)
    private readonly diagnosticClient: IDiagnosticClient,
    @Inject(ITriageRepository)
    private readonly triageRepository: ITriageRepository,
  ) {}

  @Post('start')
  @ApiOperation({ summary: 'Iniciar uma nova sessão de triagem' })
  @ApiResponse({ status: 201, description: 'Sessão iniciada e salva no banco' })
  async startTriage(@Request() req: any, @Body() _data: StartTriageDto) {
    const patientId = req.user.id;
    console.log('[Gateway] Iniciando sessão para paciente:', patientId);
    
    const session = await this.triageRepository.createSession(patientId);
    return {
      sessionId: session.id,
      status: session.status,
      currentStep: session.currentStep,
    };
  }

  @Post(':id/diagnose')
  @ApiOperation({ summary: 'Enviar sintomas para o motor de diagnóstico' })
  async diagnose(
    @Param('id') sessionId: string,
    @Body() data: DiagnoseTriageDto
  ) {
    console.log('[Gateway] Processando diagnóstico para sessão:', sessionId);
    
    // 1. Chamar o motor via gRPC
    const result = await firstValueFrom(
      this.diagnosticClient.assessSymptoms(data.symptoms, data.contextualFactors)
    );

    // 2. Atualizar a sessão no banco com os sintomas (CUIs)
    const symptomCuis = data.symptoms.map(s => s.cui);
    await this.triageRepository.updateSessionSymptoms(sessionId, symptomCuis);

    return {
      sessionId,
      diagnosis: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter status de uma sessão de triagem' })
  async getStatus(@Param('id') id: string) {
    const session = await this.triageRepository.findById(id);
    return session;
  }
}

