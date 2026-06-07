import { LinearProgress, type LinearProgressProps } from "@mui/joy";

export function PhaseProgress({
  range,
  remaining,
  ...props
}: {
  range: number;
  remaining: number;
} & LinearProgressProps) {
  return (
    <LinearProgress
      determinate
      value={Math.min(Math.max(((range - remaining) / range) * 100, 1), 100)}
      color="primary"
      variant="soft"
      {...props}
    />
  );
}
