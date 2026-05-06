import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { join } from "path";
import { DiagnosticGrpcClient } from "./diagnostic-engine.client";
import { IDiagnosticClient } from "../../domain/ports/diagnostic-client.port";
import * as fs from "fs";
import * as grpc from "@grpc/grpc-js";

@Module({
	imports: [
		ConfigModule,
		ClientsModule.registerAsync([
			{
				name: "DIAGNOSTIC_PACKAGE",
				imports: [ConfigModule],
				inject: [ConfigService],
				useFactory: (configService: ConfigService) => {
					const certsPath = join(process.cwd(), "shared/certs");
					let credentials = grpc.credentials.createInsecure();

					try {
						const rootCert = fs.readFileSync(join(certsPath, "ca.crt"));
						const clientKey = fs.readFileSync(join(certsPath, "client.key"));
						const clientCert = fs.readFileSync(join(certsPath, "client.crt"));
						credentials = grpc.credentials.createSsl(
							rootCert,
							clientKey,
							clientCert,
						);
					} catch (e) {
						console.warn("mTLS certs not found, using insecure connection");
					}

					return {
						transport: Transport.GRPC,
						options: {
							package: "diagnostic",
							protoPath: join(process.cwd(), "shared/proto/diagnostic.proto"),
							url:
								configService.get<string>("DIAGNOSTIC_ENGINE_URL") ||
								"diagnostic-engine:50051",
							credentials,
							loader: {
								keepCase: true,
							},
							channelOptions: {
								"grpc.keepalive_time_ms": 10000,
								"grpc.keepalive_timeout_ms": 5000,
								"grpc.max_receive_message_length": 10 * 1024 * 1024, // 10MB
							},
						},
					};
				},
			},
		]),
	],
	providers: [
		{
			provide: IDiagnosticClient,
			useClass: DiagnosticGrpcClient,
		},
	],
	exports: [IDiagnosticClient],
})
export class GrpcModule {}
