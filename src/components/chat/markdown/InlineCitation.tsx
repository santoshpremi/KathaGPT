import { ClickAwayListener, Popper } from "@mui/base";
import SearchIcon from "@mui/icons-material/Search";
import { Button, Card, Stack, Typography } from "@mui/joy";
import type { ComponentProps } from "react";
import React from "react";
import type {
  RagSource,
  ResultComponent,
} from "@backend/api/chat/message/messageTypes";

/**
 * Renders a citation in a button that can be clicked to show the source.
 * @param source Source that has been cited as a number
 * @param availableSources List of available sources
 */
export function InlineCitation({
  source,
  availableSources,
}: ComponentProps<"cite"> & {
  source?: string;
  availableSources: RagSource[];
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };

  let citedSource: RagSource | null = null;
  let citedResultComponent: ResultComponent | null = null;
  if (source) {
    for (const s of availableSources) {
      for (const component of s.resultComponents) {
        if (component.sourceNumber === Number(source)) {
          citedResultComponent = component;
          citedSource = s;
          break;
        }
      }
    }
  }

  return (
    <ClickAwayListener
      onClickAway={() => setAnchorEl(null)}
      mouseEvent="onMouseDown"
      touchEvent="onTouchStart"
    >
      <span>
        <Button
          size="sm"
          variant="soft"
          color="neutral"
          sx={{
            display: "inline-block",
            verticalAlign: "super",
            fontSize: "xs",
            px: 0.4,
            py: 0,
            minHeight: 0,
            borderRadius: 4,
          }}
          onClick={handleClick}
        >
          {source}
        </Button>
        <Popper
          className="z-50"
          open={Boolean(anchorEl)}
          anchorEl={anchorEl}
          placement="bottom-start"
        >
          <Card sx={{ maxWidth: "50vw", boxShadow: "md" }}>
            {citedSource && citedResultComponent && (
              <div className="flex flex-col gap-4">
                <Stack>
                  <Typography level="title-md">
                    {citedResultComponent.documentTitle}
                  </Typography>
                  <div className="flex items-center gap-1">
                    <SearchIcon />
                    <Typography level="body-sm">
                      {citedSource.queries}
                    </Typography>
                  </div>
                </Stack>

                <Typography
                  whiteSpace="pre-line"
                  variant="soft"
                  borderRadius={4}
                  padding={2}
                >
                  {citedResultComponent.result}
                </Typography>
              </div>
            )}
          </Card>
        </Popper>
      </span>
    </ClickAwayListener>
  );
}
