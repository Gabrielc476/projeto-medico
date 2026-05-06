import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ITriageRepository } from '../../domain/ports/triage-repository.port';

@Injectable()
export class AddSymptomsUseCase {
  private readonly logger = new Logger(AddSymptomsUseCase.name);

  constructor(private readonly triageRepository: ITriageRepository) {}

  async execute(sessionId: string, symptoms: string[]): Promise<void> {
    this.logger.log(`Adding symptoms to session: ${sessionId}`);
    const session = await this.triageRepository.findById(sessionId);
    if (!session) throw new NotFoundException(`Triage session ${sessionId} not found`);

    session.transition('SUBMIT_SYMPTOMS');
    
    session.setSymptoms(symptoms);
    
    await this.triageRepository.save(session);
  }
}
