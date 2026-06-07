import { Stack, Typography, CircularProgress } from "@mui/joy";

import { Button } from "@mui/joy";

interface ReferenceContainerProps {
  title: string;
  subtitle: string;
  onClick?: () => void;
  icon: React.ReactNode;
  isLoading?: boolean;
  testId?: string;
}

export default function ReferenceContainer({
  title,
  subtitle,
  onClick,
  icon,
  isLoading,
  testId,
}: ReferenceContainerProps) {
  return (
    <Button
      onClick={onClick}
      variant="soft"
      sx={{ textAlign: "left", border: "2px solid #fff" }}
      data-testid={testId}
    >
      <Stack direction="row" flex={1} gap={2.5} alignItems="center" p={0.5}>
        {icon}
        {isLoading && <CircularProgress size="sm" />}
        {!isLoading && (
          <Stack>
            <Typography level="body-md" noWrap>
              {title}
            </Typography>
            <Typography level="body-sm" className="font-normal">
              {subtitle}
            </Typography>
          </Stack>
        )}
      </Stack>
    </Button>
  );
}
