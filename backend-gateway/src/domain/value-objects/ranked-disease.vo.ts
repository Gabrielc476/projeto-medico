export interface RankedDiseaseProps {
  diseaseId: string;
  name: string;
  probability: number;
  score: number;
  explanation?: string;
}

export class RankedDisease {
  constructor(private readonly props: RankedDiseaseProps) {}

  get diseaseId(): string {
    return this.props.diseaseId;
  }

  get name(): string {
    return this.props.name;
  }

  get probability(): number {
    return this.props.probability;
  }

  get score(): number {
    return this.props.score;
  }
}
