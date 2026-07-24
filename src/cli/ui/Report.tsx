//* Libraries imports
import { Box, Text } from "ink";

//* Local imports
import { theme } from "./theme.ts";

//* Types imports
import type { LocaleReport, ValidationResult } from "../../core/types.ts";

type ReportProps = {
  result: ValidationResult;
  strictExtra: boolean;
};

function countByKind(report: LocaleReport, kind: "missing" | "extra"): number {
  return report.issues.filter((issue) => issue.kind === kind).length;
}

function LocaleSection(props: { report: LocaleReport; strictExtra: boolean }) {
  const missing = props.report.issues.filter((issue) => issue.kind === "missing");
  const extra = props.report.issues.filter((issue) => issue.kind === "extra");
  const isOk = missing.length === 0 && (!props.strictExtra || extra.length === 0);

  return (
    <Box flexDirection="column" paddingBottom={1}>
      <Text>
        <Text color={isOk ? theme.success : theme.error} bold>
          {isOk ? "✓" : "✗"}
        </Text>{" "}
        <Text bold>{props.report.locale}</Text>
        <Text color={theme.muted}>
          {" "}
          ({countByKind(props.report, "missing")} missing, {countByKind(props.report, "extra")}{" "}
          extra)
        </Text>
      </Text>

      {missing.map((issue) => (
        <Box key={`missing-${issue.path}`} paddingLeft={2}>
          <Text color={theme.error}>missing</Text>
          <Text> {issue.path}</Text>
        </Box>
      ))}

      {extra.map((issue) => (
        <Box key={`extra-${issue.path}`} paddingLeft={2}>
          <Text color={props.strictExtra ? theme.error : theme.warning}>extra</Text>
          <Text> {issue.path}</Text>
        </Box>
      ))}
    </Box>
  );
}

export function Report(props: ReportProps) {
  const totalMissing = props.result.issues.filter((issue) => issue.kind === "missing").length;
  const totalExtra = props.result.issues.filter((issue) => issue.kind === "extra").length;
  const failed = totalMissing > 0 || (props.strictExtra && totalExtra > 0);

  return (
    <Box flexDirection="column" paddingY={1}>
      <Text bold>Catlex validate</Text>
      <Text color={theme.muted}>
        base: {props.result.baseLocale}.json · dir: {props.result.messagesDir}
      </Text>
      <Box paddingTop={1} flexDirection="column">
        {props.result.reports.length === 0 ? (
          <Text color={theme.warning}>
            No other locale files to compare against {props.result.baseLocale}.json
          </Text>
        ) : (
          props.result.reports.map((report) => (
            <LocaleSection key={report.locale} report={report} strictExtra={props.strictExtra} />
          ))
        )}
      </Box>
      <Text>
        {failed ? (
          <Text color={theme.error} bold>
            Failed
          </Text>
        ) : (
          <Text color={theme.success} bold>
            Passed
          </Text>
        )}
        <Text color={theme.muted}>
          {" "}
          · {totalMissing} missing · {totalExtra} extra
        </Text>
      </Text>
    </Box>
  );
}
