import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { GrpcModule } from './grpc/grpc.module';
import { InMemorySymptomCache } from './cache/in-memory-symptom.cache';
import { DatabaseModule } from './database/database.module';
import { ISymptomCache } from '../domain/ports/symptom-cache.port';
import { IDiagnosticClient } from '../domain/ports/diagnostic-client.port';
import { DiagnosticGrpcClient } from './grpc/diagnostic-engine.client';

@Module({
  imports: [
    CacheModule.register(),
    GrpcModule,
    DatabaseModule,
  ],
  providers: [
    {
      provide: ISymptomCache,
      useClass: InMemorySymptomCache,
    },
    {
      provide: IDiagnosticClient,
      useClass: DiagnosticGrpcClient,
    },
  ],
  exports: [ISymptomCache, IDiagnosticClient, DatabaseModule, GrpcModule],
})
export class InfrastructureModule {}
