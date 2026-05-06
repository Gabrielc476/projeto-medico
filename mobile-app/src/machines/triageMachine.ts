import { createMachine } from "xstate";

export const triageMachine = createMachine({
  id: "triage",
  initial: "idle",
  states: {
    idle: {
      on: {
        START: { target: "uploadingExam" },
      },
    },
    uploadingExam: {
      on: {
        UPLOAD_SUCCESS: { target: "extractingContext" },
        SKIP: { target: "extractingContext" },
        BACK: { target: "idle" },
      },
    },
    extractingContext: {
      on: {
        SUBMIT_SUCCESS: { target: "mappingSymptoms" },
        SKIP: { target: "mappingSymptoms" },
        BACK: { target: "uploadingExam" },
      },
    },
    mappingSymptoms: {
      on: {
        SUBMIT_SUCCESS: { target: "processingDiagnosis" },
        BACK: { target: "extractingContext" },
      },
    },
    processingDiagnosis: {
      on: {
        DIAGNOSIS_SUCCESS: { target: "completed" },
        DIAGNOSIS_FAILURE: { target: "mappingSymptoms" },
      },
    },
    completed: {
      on: {
        RESET: { target: "idle" },
      },
    },
  },
});
export type TriageMachineType = typeof triageMachine;
