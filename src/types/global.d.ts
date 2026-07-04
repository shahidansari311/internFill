/// <reference types="vite/client" />
/// <reference types="chrome" />

declare module '*.css' {
  const content: string;
  export default content;
}

declare module '*.svg' {
  const content: string;
  export default content;
}

declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.jpg' {
  const content: string;
  export default content;
}

declare module '*.webp' {
  const content: string;
  export default content;
}

// Chrome extension message types
interface AutofillMessage {
  type: 'AUTOFILL_PAGE';
  profileId: string;
}

interface DetectFieldsMessage {
  type: 'DETECT_FIELDS';
}

interface FieldsDetectedMessage {
  type: 'FIELDS_DETECTED';
  fields: DetectedFormField[];
}

interface GetProfileDataMessage {
  type: 'GET_PROFILE_DATA';
  profileId: string;
}

interface DetectedFormField {
  element: string;
  fieldType: string;
  confidence: number;
  selector: string;
}

interface GenerateAIAnswerMessage {
  type: 'GENERATE_AI_ANSWER';
  profile: any;
  questionType: 'whyHire' | 'projectsDetail';
  questionText?: string;
}

type ExtensionMessage =
  | AutofillMessage
  | DetectFieldsMessage
  | FieldsDetectedMessage
  | GetProfileDataMessage
  | GenerateAIAnswerMessage;
