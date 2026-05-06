import { 
  Controller, Post, Body, Get, Param, Inject, UseGuards, Request, 
  UseInterceptors, UploadedFile, ParseFilePipe, MaxFileSizeValidator, FileTypeValidator,
  NotFoundException, ForbiddenException, Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ITriageRepository } from '../../domain/ports/triage-repository.port';
import { JwtAuthGuard } from '../../infrastructure/auth/jwt-auth.guard';
import { StartTriageDto, DiagnoseTriageDto, ExtractContextDto } from './dtos/triage.dto';
import { ExtractContextUseCase } from '../../application/use-cases/extract-context.use-case';
import { ExtractExamUseCase } from '../../application/use-cases/extract-exam.use-case';
import { DiagnoseUseCase } from '../../application/use-cases/diagnose.use-case';
import { AddSymptomsUseCase } from '../../application/use-cases/add-symptoms.use-case';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse, ApiConsumes, ApiBody } from '@nestjs/swagger';
import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';

@ApiTags('Triage')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('triage')
export class TriageController {
  private readonly logger = new Logger(TriageController.name);

  constructor(
    @Inject(ITriageRepository)
    private readonly triageRepository: ITriageRepository,
    private readonly extractContextUseCase: ExtractContextUseCase,
    private readonly extractExamUseCase: ExtractExamUseCase,
    private readonly diagnoseUseCase: DiagnoseUseCase,
    private readonly addSymptomsUseCase: AddSymptomsUseCase,
  ) {}

  @Post('start')
  @ApiOperation({ summary: 'Iniciar uma nova sessão de triagem' })
  @ApiResponse({ status: 201, description: 'Sessão iniciada e salva no banco' })
  async startTriage(@Request() req: any, @Body() _data: StartTriageDto) {
    const patientId = req.user.id;
    this.logger.log(`Iniciando sessão para paciente: ${patientId}`);
    
    const session = await this.triageRepository.createSession(patientId);
    return {
      sessionId: session.id,
      status: session.status,
    };
  }

  @Post(':id/skip-exam')
  @ApiOperation({ summary: 'Pular etapa de exame' })
  async skipExam(@Param('id') sessionId: string, @Request() req: any) {
    const session = await this.validateSessionOwnership(sessionId, req.user.id);
    session.transition('SKIP_EXAM');
    await this.triageRepository.save(session);
    return { sessionId, status: session.status };
  }

  @Post(':id/skip-context')
  @ApiOperation({ summary: 'Pular etapa de contexto' })
  async skipContext(@Param('id') sessionId: string, @Request() req: any) {
    const session = await this.validateSessionOwnership(sessionId, req.user.id);
    session.transition('SKIP_CONTEXT');
    await this.triageRepository.save(session);
    return { sessionId, status: session.status };
  }

  @Post(':id/context')
  @ApiOperation({ summary: 'Extrair fatores contextuais de texto livre' })
  async extractContext(
    @Param('id') sessionId: string,
    @Body() data: ExtractContextDto,
    @Request() req: any,
  ) {
    await this.validateSessionOwnership(sessionId, req.user.id);
    const features = await this.extractContextUseCase.execute(sessionId, data.text);
    return { sessionId, features };
  }

  @Post(':id/exam')
  @ApiOperation({ summary: 'Extrair fatores de risco de exames laboratoriais (PDF)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadExam(
    @Param('id') sessionId: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }), // 5MB
          new FileTypeValidator({ fileType: 'application/pdf' }),
        ],
      }),
    ) file: Express.Multer.File,
    @Request() req: any,
  ) {
    await this.validateSessionOwnership(sessionId, req.user.id);

    // Armazenamento físico do exame
    const uploadDir = path.join(process.cwd(), 'uploads', 'exams');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    const fileName = `${randomUUID()}.pdf`;
    const filePath = path.join(uploadDir, fileName);
    await fs.promises.writeFile(filePath, file.buffer);
    
    const examUrl = `/uploads/exams/${fileName}`;

    const features = await this.extractExamUseCase.execute(sessionId, file.buffer, examUrl);
    return { sessionId, features, examUrl };
  }

  @Post(':id/symptoms')
  @ApiOperation({ summary: 'Enviar sintomas' })
  async submitSymptoms(
    @Param('id') sessionId: string, 
    @Body() data: DiagnoseTriageDto, 
    @Request() req: any
  ) {
    await this.validateSessionOwnership(sessionId, req.user.id);
    await this.addSymptomsUseCase.execute(sessionId, data.symptoms.map(s => s.cui));
    return { sessionId, status: 'READY_FOR_DIAGNOSIS' };
  }

  @Post(':id/diagnose')
  @ApiOperation({ summary: 'Processar diagnóstico final' })
  async diagnose(
    @Param('id') sessionId: string,
    @Request() req: any,
  ) {
    await this.validateSessionOwnership(sessionId, req.user.id);
    this.logger.log(`Processando diagnóstico para sessão: ${sessionId}`);
    
    const result = await this.diagnoseUseCase.execute(sessionId);

    return {
      sessionId,
      diagnosis: result,
    };
  }

  @Get()
  @ApiOperation({ summary: 'Obter histórico de todas as triagens do paciente' })
  async getHistory(@Request() req: any) {
    const sessions = await this.triageRepository.findByPatientId(req.user.id);
    return sessions;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter status de uma sessão de triagem' })
  async getStatus(@Param('id') id: string, @Request() req: any) {
    const session = await this.validateSessionOwnership(id, req.user.id);
    return session;
  }

  private async validateSessionOwnership(sessionId: string, userId: string) {
    const session = await this.triageRepository.findById(sessionId);
    if (!session) {
      throw new NotFoundException(`Sessão de triagem ${sessionId} não encontrada`);
    }
    if (session.patientId !== userId) {
      throw new ForbiddenException('Você não tem acesso a esta sessão de triagem');
    }
    return session;
  }
}
