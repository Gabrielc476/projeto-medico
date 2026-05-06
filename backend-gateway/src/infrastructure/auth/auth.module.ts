import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "../../application/services/auth.service";
import { AuthController } from "../../presentation/http/auth.controller";
import { JwtStrategy } from "./jwt.strategy";
import { DatabaseModule } from "../database/database.module";

@Module({
	imports: [
		PassportModule,
		DatabaseModule,
		JwtModule.registerAsync({
			imports: [ConfigModule],
			inject: [ConfigService],
			useFactory: (config: ConfigService) => ({
				secret: config.getOrThrow<string>("JWT_SECRET"),
				signOptions: { expiresIn: "1h" },
			}),
		}),
	],
	controllers: [AuthController],
	providers: [AuthService, JwtStrategy],
	exports: [AuthService],
})
export class AuthModule {}
