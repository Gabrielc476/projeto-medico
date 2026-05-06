import { setup } from 'xstate';

export const triageMachine = setup({
  types: {
    events: {} as
      | { type: 'UPLOAD_EXAM' }
      | { type: 'SKIP_EXAM' }
      | { type: 'EXTRACT_CONTEXT' }
      | { type: 'SKIP_CONTEXT' }
      | { type: 'SUBMIT_SYMPTOMS' }
      | { type: 'DIAGNOSE' }
      | { type: 'CANCEL' },
  },
}).createMachine({
  id: 'triage',
  initial: 'EXAM_COLLECTION',
  states: {
    EXAM_COLLECTION: {
      on: {
        UPLOAD_EXAM: { target: 'CONTEXT_COLLECTION' },
        SKIP_EXAM: { target: 'CONTEXT_COLLECTION' },
        CANCEL: { target: 'CANCELLED' }
      }
    },
    CONTEXT_COLLECTION: {
      on: {
        EXTRACT_CONTEXT: { target: 'SYMPTOM_MAPPING' },
        SKIP_CONTEXT: { target: 'SYMPTOM_MAPPING' },
        CANCEL: { target: 'CANCELLED' }
      }
    },
    SYMPTOM_MAPPING: {
      on: {
        SUBMIT_SYMPTOMS: { target: 'READY_FOR_DIAGNOSIS' },
        CANCEL: { target: 'CANCELLED' }
      }
    },
    READY_FOR_DIAGNOSIS: {
      on: {
        DIAGNOSE: { target: 'COMPLETED' },
        CANCEL: { target: 'CANCELLED' }
      }
    },
    COMPLETED: { type: 'final' },
    CANCELLED: { type: 'final' }
  }
});
