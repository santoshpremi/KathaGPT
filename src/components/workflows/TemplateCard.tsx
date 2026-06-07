import { Card, CardContent, Typography } from "@mui/joy";

interface TemplateCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

export default function TemplateCard({
  title,
  description,
  onClick,
}: TemplateCardProps) {
  return (
    <Card
      sx={{
        minHeight: 120,
        width: "100%",
        "&:hover": {
          backgroundColor: "background.level1",
          cursor: "pointer",
        },
      }}
      onClick={onClick}
    >
      <CardContent>
        <Typography level="title-sm">{title} </Typography>
        <Typography level="body-sm">{description} </Typography>
      </CardContent>
    </Card>
  );
}
