import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { DiagnosticGrpcClient } from './diagnostic-engine.client';

@Module({
  imports: [
    ConfigModule,
    ClientsModule.registerAsync([
      {
        name: 'DIAGNOSTIC_PACKAGE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            package: 'diagnostic',
            protoPath: join(process.cwd(), 'shared/proto/diagnostic.proto'),
            url: configService.get<string>('DIAGNOSTIC_ENGINE_URL') || 'diagnostic-engine:50051',
          },
        }),
      },
    ]),
  ],
  providers: [DiagnosticGrpcClient],
  exports: [DiagnosticGrpcClient],
})
export class GrpcModule {}
