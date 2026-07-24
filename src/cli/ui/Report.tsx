//* Libraries imports
import { Box, Text } from "ink";

//* Local imports
import { hasFailingIssues } from "../../core/validate.ts";
import { theme } from "./theme.ts";

//* Types imports
import type { LocaleReport, ValidationIssue, ValidationResult } from "../../core/types.ts";

type ReportProps = {
  result: ValidationResult;
  strictExtra: boolean;
};

function issuesOfKind(issues: ValidationIssue[], kind: "missing" | "extra"): ValidationIssue[] {
  return issues.filter((issue) => issue.kind === kind);
}

function StatusMark(props: { ok: boolean }) {
  if (props.ok) {
    return (
      <Text color={theme.success} bold>
        ✓
      </Text>
    );
  }

  return (
    <Text color={theme.error} bold>
      ✗
    </Text>
  );
}

function IssueList(props: { issues: ValidationIssue[]; label: string; color: string }) {
  return (
    <>
      {props.issues.map((issue) => (
        <Box key={`${props.label}-${issue.path}`} paddingLeft={2}>
          <Text color={props.color}>{props.label}</Text>
          <Text> {issue.path}</Text>
        </Box>
      ))}
    </>
  );
}

function LocaleSection(props: { report: LocaleReport; strictExtra: boolean }) {
  const missing = issuesOfKind(props.report.issues, "missing");
  const extra = issuesOfKind(props.report.issues, "extra");
  const isOk = !hasFailingIssues(props.report.issues, props.strictExtra);
  const extraColor = props.strictExtra ? theme.error : theme.warning;

  return (
    <Box flexDirection="column" paddingBottom={1}>
      <Text>
        <StatusMark ok={isOk} /> <Text bold>{props.report.locale}</Text>
        <Text color={theme.muted}>
          {" "}
          ({missing.length} missing, {extra.length} extra)
        </Text>
      </Text>

      <IssueList issues={missing} label="missing" color={theme.error} />
      <IssueList issues={extra} label="extra" color={extraColor} />
    </Box>
  );
}

function LocaleReports(props: {
  reports: LocaleReport[];
  baseLocale: string;
  strictExtra: boolean;
}) {
  if (props.reports.length === 0) {
    return (
      <Text color={theme.warning}>
        No other locale files to compare against {props.baseLocale}.json
      </Text>
    );
  }

  return (
    <>
      {props.reports.map((report) => (
        <LocaleSection key={report.locale} report={report} strictExtra={props.strictExtra} />
      ))}
    </>
  );
}

function Verdict(props: { failed: boolean; missing: number; extra: number }) {
  if (props.failed) {
    return (
      <Text>
        <Text color={theme.error} bold>
          Failed
        </Text>
        <Text color={theme.muted}>
          {" "}
          · {props.missing} missing · {props.extra} extra
        </Text>
      </Text>
    );
  }

  return (
    <Text>
      <Text color={theme.success} bold>
        Passed
      </Text>
      <Text color={theme.muted}>
        {" "}
        · {props.missing} missing · {props.extra} extra
      </Text>
    </Text>
  );
}

export function Report(props: ReportProps) {
  const missing = issuesOfKind(props.result.issues, "missing");
  const extra = issuesOfKind(props.result.issues, "extra");
  const failed = hasFailingIssues(props.result.issues, props.strictExtra);

  return (
    <Box flexDirection="column" paddingY={1}>
      <Text bold>Catlex validate</Text>
      <Text color={theme.muted}>
        base: {props.result.baseLocale}.json · dir: {props.result.messagesDir}
      </Text>
      <Box paddingTop={1} flexDirection="column">
        <LocaleReports
          reports={props.result.reports}
          baseLocale={props.result.baseLocale}
          strictExtra={props.strictExtra}
        />
      </Box>
      <Verdict failed={failed} missing={missing.length} extra={extra.length} />
    </Box>
  );
}
