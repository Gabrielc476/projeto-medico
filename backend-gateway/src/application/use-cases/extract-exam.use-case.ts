import { Injectable, Logger, NotFoundException } from "@nestjs/common";
import { IDiagnosticClient } from "../../domain/ports/diagnostic-client.port";
import { ITriageRepository } from "../../domain/ports/triage-repository.port";
import { firstValueFrom, timeout } from "rxjs";
import {
	type ExtractedFeature,
	type ContextExtractionResponse,
} from "../../domain/types/diagnostic";

@Injectable()
export class ExtractExamUseCase {
	private readonly logger = new Logger(ExtractExamUseCase.name);

	constructor(
		private readonly diagnosticClient: IDiagnosticClient,
		private readonly triageRepository: ITriageRepository,
	) {}

	async execute(
		sessionId: string,
		pdfBuffer: Buffer,
		examUrl: string,
	): Promise<ExtractedFeature[]> {
		this.logger.log(`Extracting exam features for session: ${sessionId}`);

		const session = await this.triageRepository.findById(sessionId);
		if (!session) {
			throw new NotFoundException(`Triage session ${sessionId} not found`);
		}

		try {
			const response = (await firstValueFrom(
				this.diagnosticClient.extractExam(pdfBuffer).pipe(timeout(30000)),
			)) as ContextExtractionResponse;

			const newFactors = response.features
				.filter((f) => f.is_present)
				.map((f) => f.cui);

			// Merge with existing factors
			const existingFactors = session.contextualFactors || [];
			const mergedFactors = Array.from(
				new Set([...existingFactors, ...newFactors]),
			);

			session.transition("UPLOAD_EXAM");
			await this.triageRepository.updateSessionContext(
				sessionId,
				mergedFactors,
			);
			await this.triageRepository.updateSessionExamUrl(sessionId, examUrl);

			return response.features;
		} catch (error) {
			this.logger.error("Failed to extract exam features", error);
			throw error;
		}
	}
}
