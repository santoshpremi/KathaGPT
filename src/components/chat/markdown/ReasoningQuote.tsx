import Accordion from "@mui/joy/Accordion";
import AccordionDetails from "@mui/joy/AccordionDetails";
import AccordionSummary from "@mui/joy/AccordionSummary";
import Typography from "@mui/joy/Typography";
import ReactMarkdown from "react-markdown";
import { useTranslation } from "../../../lib/i18n";

export function ReasoningQuote({
  thoughts,
  isThinking,
}: {
  thoughts: string;
  isThinking: boolean;
}) {
  const { t } = useTranslation();
  return (
    <Accordion
      defaultExpanded={true}
      sx={{
        "& [hidden]": {
          display: "grid !important",
        },
        "& > div": {
          transition: "grid 0.2s ease",
        },
      }}
    >
      <AccordionSummary
        className="!-ml-2 mb-1 w-fit"
        slotProps={{
          button: {
            sx: {
              borderRadius: "lg",
              px: 1,
              py: 0.5,
            },
          },
        }}
      >
        <Typography
          sx={{ mb: "0!important" }}
          className={isThinking ? "light-sweep" : ""}
        >
          {isThinking ? t("reasoning") : t("reasoningProcess")}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <ReactMarkdown>{thoughts}</ReactMarkdown>
      </AccordionDetails>
    </Accordion>
  );
}
