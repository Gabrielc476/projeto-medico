import { describe, it, expect } from 'vitest';
import { RawSymptom } from './raw-symptom.vo';

describe('RawSymptom', () => {
  it('should create a raw symptom with provided props', () => {
    const symptom = new RawSymptom({
      text: 'fever and cough',
      source: 'TEXT',
      extractedCuis: ['C0001', 'C0002'],
    });

    expect(symptom.text).toBe('fever and cough');
    expect(symptom.source).toBe('TEXT');
    expect(symptom.extractedCuis).toEqual(['C0001', 'C0002']);
  });

  it('should return empty array for cuis if not provided', () => {
    const symptom = new RawSymptom({
      text: 'fever',
      source: 'TEXT',
    });

    expect(symptom.extractedCuis).toEqual([]);
  });
});
