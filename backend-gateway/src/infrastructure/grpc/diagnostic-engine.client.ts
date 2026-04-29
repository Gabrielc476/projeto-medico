import { Injectable, OnModuleInit, Inject } from '@nestjs/common';
import { Client, type ClientGrpc, Transport } from '@nestjs/microservices';
import { join } from 'path';

import { DiagnosticService } from '../../domain/types/diagnostic';
import { IDiagnosticClient } from '../../domain/ports/diagnostic-client.port';

@Injectable()
export class DiagnosticGrpcClient implements OnModuleInit, IDiagnosticClient {
  private diagnosticService!: DiagnosticService;

  constructor(@Inject('DIAGNOSTIC_PACKAGE') private readonly client: ClientGrpc) {}

  onModuleInit() {
    this.diagnosticService = this.client.getService<DiagnosticService>('DiagnosticService');
  }

  getAppSymptoms() {
    return this.diagnosticService.getAppSymptoms({});
  }
}
