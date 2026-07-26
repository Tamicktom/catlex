//* Local imports
export { loadConfig, ConfigLoadError } from "./core/config/load.ts";
export { DEFAULT_CONFIG } from "./core/config/defaults.ts";
export { catlexConfigSchema } from "./core/config/schema.ts";
export { flattenMessages } from "./core/messages/flatten.ts";
export {
  compareFlatMessages,
  compareResultToIssues,
} from "./core/messages/compare.ts";
export {
  loadMessagesDir,
  splitBaseAndLocales,
} from "./core/messages/load.ts";
export { runValidators, getValidators } from "./core/validators/registry.ts";
export {
  validateTranslations,
  hasFailingIssues,
} from "./core/validate.ts";
export { scanHardcoded } from "./core/scan/scan.ts";
export {
  isLikelyUserVisible,
  isUserFacingAttribute,
  USER_FACING_ATTRS,
} from "./core/scan/filters.ts";
export {
  WORKFLOW_RELATIVE_PATH,
  resolveWorkflowPath,
} from "./core/init-ci/paths.ts";
export { generateValidateMessagesWorkflow } from "./core/init-ci/workflow.ts";
export { writeGithubWorkflow } from "./core/init-ci/write.ts";
export { TRANSLATE_ALPHA_MESSAGE } from "./core/translate/alpha.ts";
export {
  collectMissingTranslations,
  collectTranslationExamples,
} from "./core/translate/collect.ts";
export {
  DEFAULT_OPENAI_TRANSLATE_MODEL,
  MissingOpenAiApiKeyError,
  MissingSubmitTranslationsError,
  assertOpenAiApiKey,
  createOpenAiTranslator,
} from "./core/translate/openai.ts";
export {
  TRANSLATE_INSTRUCTIONS,
  buildTranslatePrompt,
} from "./core/translate/prompt.ts";
export {
  extractIcuPlaceholders,
  submitTranslationsSchema,
  validateSubmittedTranslations,
} from "./core/translate/schema.ts";
export {
  DEFAULT_TRANSLATE_CHUNK_SIZE,
  translateMissingKeys,
} from "./core/translate/translate.ts";
export { writeTranslatedReports } from "./core/translate/write-reports.ts";
export {
  applyTranslationsToTree,
  setPathInTree,
} from "./core/messages/unflatten.ts";
export { writeLocaleMessages } from "./core/messages/write.ts";

export type {
  CatlexConfig,
  FlatMessages,
  LocaleMessages,
  LocaleReport,
  MessageTree,
  ValidationIssue,
  ValidationIssueKind,
  ValidationResult,
  ValidatorContext,
} from "./core/types.ts";
export type { ConfigFlags, CatlexConfigInput } from "./core/config/schema.ts";
export type { Validator } from "./core/validators/types.ts";
export type { ValidateOptions } from "./core/validate.ts";
export type {
  HardcodedIssue,
  HardcodedIssueKind,
  ScanResult,
} from "./core/scan/types.ts";
export type {
  WriteGithubWorkflowOptions,
  WriteGithubWorkflowResult,
} from "./core/init-ci/write.ts";
export type {
  CollectMissingOptions,
  CollectMissingResult,
  MissingTranslation,
  SkippedTranslation,
  TranslationExample,
} from "./core/translate/collect.ts";
export type { CreateOpenAiTranslatorOptions } from "./core/translate/openai.ts";
export type {
  BuildTranslatePromptOptions,
  PromptMissingItem,
} from "./core/translate/prompt.ts";
export type {
  PlaceholderWarning,
  SubmitTranslationsInput,
  ValidateSubmittedResult,
} from "./core/translate/schema.ts";
export type {
  LocaleTranslateReport,
  TranslateLocaleFn,
  TranslateLocaleInput,
  TranslateMissingKeysOptions,
  TranslateResult,
  TranslatedItem,
} from "./core/translate/translate.ts";
export type { TranslationPatch } from "./core/messages/unflatten.ts";
