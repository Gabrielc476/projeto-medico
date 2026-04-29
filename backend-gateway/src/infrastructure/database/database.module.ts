import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaTriageRepository } from './prisma-triage.repository';
import { ITriageRepository } from '../../domain/ports/triage-repository.port';

@Module({
  providers: [
    PrismaService,
    {
      provide: ITriageRepository,
      useClass: PrismaTriageRepository,
    },
  ],
  exports: [PrismaService, ITriageRepository],
})
export class DatabaseModule {}
