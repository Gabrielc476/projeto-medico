import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { GrpcModule } from '../../src/infrastructure/grpc/grpc.module';
import { DiagnosticGrpcClient } from '../../src/infrastructure/grpc/diagnostic-engine.client';
import { ConfigModule } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

describe('DiagnosticGrpcClient (Integration)', () => {
  let client: DiagnosticGrpcClient;
  let module: TestingModule;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        GrpcModule,
      ],
    }).compile();

    client = module.get<DiagnosticGrpcClient>(DiagnosticGrpcClient);
    // OnModuleInit will be called by Nest when we call init()
    await module.init();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should receive symptoms from the real Python Diagnostic Engine', async () => {
    try {
      const response = await firstValueFrom(client.getAppSymptoms());
      
      expect(response).toBeDefined();
      expect(response.symptoms).toBeDefined();
      expect(Array.isArray(response.symptoms)).toBe(true);
      
      console.log(`Received ${response.symptoms?.length} symptoms from Python engine.`);
    } catch (error) {
      console.error('Integration test failed. Is the Python engine running?', error);
      throw error;
    }
  }, 30000);
});
