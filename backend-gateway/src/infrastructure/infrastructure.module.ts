import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { GrpcModule } from './grpc/grpc.module';
import { InMemorySymptomCache } from './cache/in-memory-symptom.cache';
import { DatabaseModule } from './database/database.module';
import { ISymptomCache } from '../domain/ports/symptom-cache.port';
import { KafkaModule } from './messaging/kafka.module';

@Module({
  imports: [
    CacheModule.register(),
    GrpcModule,
    DatabaseModule,
    KafkaModule,
  ],
  providers: [
    {
      provide: ISymptomCache,
      useClass: InMemorySymptomCache,
    },
  ],
  exports: [ISymptomCache, DatabaseModule, GrpcModule, KafkaModule],
})
export class InfrastructureModule {}
