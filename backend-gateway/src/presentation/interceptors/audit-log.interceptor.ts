import {
	Injectable,
	NestInterceptor,
	ExecutionContext,
	CallHandler,
	Logger,
} from "@nestjs/common";
import { Observable, throwError } from "rxjs";
import { catchError, tap } from "rxjs/operators";
import { KafkaService } from "../../infrastructure/messaging/kafka.service";

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
	private readonly logger = new Logger(AuditLogInterceptor.name);

	constructor(private readonly kafkaService: KafkaService) {}

	intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
		const request = context.switchToHttp().getRequest();
		const { method, url, body, user } = request;
		const startTime = Date.now();

		// Log clinical and auth actions
		const isClinicalAction =
			url.includes("/triage") ||
			url.includes("/symptoms") ||
			url.includes("/auth");

		if (!isClinicalAction) return next.handle();

		return next.handle().pipe(
			tap(async (response) => {
				const duration = Date.now() - startTime;
				await this.logAction(
					method,
					url,
					body,
					user,
					response,
					duration,
					"SUCCESS",
				);
			}),
			catchError((error) => {
				const duration = Date.now() - startTime;
				this.logAction(
					method,
					url,
					body,
					user,
					null,
					duration,
					"FAILURE",
					error.message,
				);
				return throwError(() => error);
			}),
		);
	}

	private async logAction(
		method: string,
		url: string,
		payload: any,
		user: any,
		_response: any,
		duration: number,
		status: "SUCCESS" | "FAILURE",
		errorMessage?: string,
	) {
		const auditEvent = {
			timestamp: new Date().toISOString(),
			userId: user?.id || "anonymous",
			userEmail: user?.email || "anonymous",
			action: `${method} ${url}`,
			payload: this.sanitize(payload),
			status,
			durationMs: duration,
			metadata: {
				errorMessage,
				// We can add more context here if needed
			},
		};

		try {
			// In a real scenario, we might want to ensure this doesn't block the response
			// but here we want reliability.
			await this.kafkaService.emit("audit.logs", auditEvent);
			this.logger.debug(`Audit log published for ${method} ${url}`);
		} catch (e) {
			this.logger.error("Failed to publish audit log to Kafka", e);
		}
	}

	private sanitize(data: any): any {
		if (!data) return data;
		if (typeof data !== "object") return data;

		const sensitiveFields = ["password", "token", "passwordHash", "buffer"];
		const sanitized = { ...data };

		for (const field of sensitiveFields) {
			if (sanitized[field]) sanitized[field] = "********";
		}

		// Also remove buffers or large binary data if any
		if (sanitized.file && sanitized.file.buffer) {
			sanitized.file = { ...sanitized.file, buffer: "********" };
		}

		return sanitized;
	}
}
