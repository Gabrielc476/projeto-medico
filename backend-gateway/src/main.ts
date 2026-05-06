import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const configService = app.get(ConfigService);
	const logger = new Logger("Bootstrap");

	// Configurar CORS com origins específicas
	const corsOrigin = configService.get<string>(
		"CORS_ORIGIN",
		"http://localhost:3001",
	);
	app.enableCors({
		origin: corsOrigin.split(",").map((o) => o.trim()),
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
		credentials: true,
	});

	// Validação global
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
			forbidNonWhitelisted: true,
			transform: true,
		}),
	);

	// Configuração do Swagger
	const config = new DocumentBuilder()
		.setTitle("CDSS API Gateway")
		.setDescription("API de Triagem Médica Inteligente e Diagnóstico")
		.setVersion("1.0")
		.addBearerAuth()
		.build();
	const document = SwaggerModule.createDocument(app, config);
	SwaggerModule.setup("api/docs", app, document);

	const port = configService.get<number>("PORT", 3000);
	await app.listen(port);
	logger.log(`Servidor rodando em: http://localhost:${port}`);
	logger.log(`Documentação Swagger em: http://localhost:${port}/api/docs`);
}
bootstrap();
