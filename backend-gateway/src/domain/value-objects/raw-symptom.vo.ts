export interface RawSymptomProps {
  text: string;
  source: 'TEXT' | 'VOICE' | 'EXAM';
  extractedCuis?: string[];
}

export class RawSymptom {
  constructor(private readonly props: RawSymptomProps) {}

  get text(): string {
    return this.props.text;
  }

  get source(): string {
    return this.props.source;
  }

  get extractedCuis(): string[] {
    return this.props.extractedCuis || [];
  }
}
