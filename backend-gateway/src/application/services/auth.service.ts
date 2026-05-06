import {
	Injectable,
	UnauthorizedException,
	ConflictException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { IPatientRepository } from "../../domain/ports/patient-repository.port";
import { Patient } from "../../domain/entities/patient.entity";
import {
	RegisterPatientDto,
	LoginDto,
} from "../../presentation/http/dtos/auth.dto";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
	constructor(
		private readonly patientRepository: IPatientRepository,
		private jwtService: JwtService,
	) {}

	async register(data: RegisterPatientDto) {
		const existingUser = await this.patientRepository.findByEmail(data.email);

		if (existingUser) {
			throw new ConflictException("E-mail já cadastrado");
		}

		const hashedPassword = await bcrypt.hash(data.password, 10);

		const user = Patient.create({
			name: data.name,
			email: data.email,
			passwordHash: hashedPassword,
		});

		await this.patientRepository.save(user);

		return this.generateToken(user);
	}

	async login(data: LoginDto) {
		const user = await this.patientRepository.findByEmail(data.email);

		if (!user) {
			throw new UnauthorizedException("Credenciais inválidas");
		}

		const isPasswordValid = await bcrypt.compare(
			data.password,
			user.passwordHash,
		);

		if (!isPasswordValid) {
			throw new UnauthorizedException("Credenciais inválidas");
		}

		return this.generateToken(user);
	}

	private generateToken(user: Patient) {
		const payload = { sub: user.id, email: user.email };
		return {
			access_token: this.jwtService.sign(payload),
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
			},
		};
	}
}
