import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { IDiagnosticClient } from "../../domain/ports/diagnostic-client.port";
import { ITriageRepository } from "../../domain/ports/triage-repository.port";
import { firstValueFrom, timeout } from "rxjs";
import {
	type ExtractedFeature,
	type ContextExtractionResponse,
} from "../../domain/types/diagnostic";

@Injectable()
export class ExtractContextUseCase {
	private readonly logger = new Logger(ExtractContextUseCase.name);

	constructor(
		private readonly diagnosticClient: IDiagnosticClient,
		private readonly triageRepository: ITriageRepository,
	) {}

	async execute(
		sessionId: string,
		freeText: string,
	): Promise<ExtractedFeature[]> {
		this.logger.log(`Extracting context for session: ${sessionId}`);

		const session = await this.triageRepository.findById(sessionId);
		if (!session) {
			throw new NotFoundException(`Triage session ${sessionId} not found`);
		}

		try {
			const response = (await firstValueFrom(
				this.diagnosticClient.extractContext(freeText).pipe(timeout(30000)),
			)) as ContextExtractionResponse;

			const factors = response.features
				.filter((f) => f.is_present)
				.map((f) => f.cui);

			session.transition("EXTRACT_CONTEXT");
			await this.triageRepository.updateSessionContext(sessionId, factors);

			return response.features;
		} catch (error) {
			this.logger.error("Failed to extract context", error);
			throw error;
		}
	}
}
