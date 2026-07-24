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
