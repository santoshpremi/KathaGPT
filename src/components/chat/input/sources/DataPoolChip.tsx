import SearchIcon from "@mui/icons-material/Search";
import TextSnippetIcon from "@mui/icons-material/TextSnippet";
import {
  Button,
  Chip,
  List,
  ListItem,
  Modal,
  ModalClose,
  ModalDialog,
  Sheet,
  Typography,
} from "@mui/joy";
import ListItemContent from "@mui/joy/ListItemContent";
import React, { useState } from "react";
import { useTranslation } from "../../../../lib/i18n";
import { type ResultComponent } from "@backend/api/chat/message/messageTypes";
import { useKnowledgeCollections } from "../../../../lib/api/localHooks";

export function DataPoolChip({
  id,
  results,
}: {
  id: string;
  results: { queries: Record<string, ResultComponent[]> };
}) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const knowledgeCollections = useKnowledgeCollections();

  if (!knowledgeCollections.data || knowledgeCollections.error) {
    return null;
  }

  const knowledgeCollection = knowledgeCollections.data.find((pool) => pool.id === id);

  if (!knowledgeCollection) {
    return null;
  }

  const numResults = Object.values(results.queries ?? {}).reduce(
    (acc, val) => acc + (val.length ?? 0),
    0,
  );

  return (
    <>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ModalDialog className="overflow-hidden" maxWidth="lg">
          <ModalClose />
          <Typography level="h4" fontStyle="bold">
            {knowledgeCollection.name}
          </Typography>
          <div className="overflow-y-auto overflow-x-hidden px-2">
            {results.queries &&
              Object.entries(results.queries).map(
                ([query, resultComponents]) => (
                  <>
                    <List sx={{ mb: 6 }}>
                      {query && (
                        <ListItem>
                          <ListItemContent>
                            <Typography
                              startDecorator={<SearchIcon />}
                              level="body-md"
                              p={1}
                              mb={3}
                              variant="outlined"
                              sx={{ borderRadius: 8 }}
                            >
                              {query}
                            </Typography>
                          </ListItemContent>
                        </ListItem>
                      )}

                      {resultComponents?.map((resultComponent, i) => (
                        <ListItem key={`result-${i}`} sx={{ mb: 3 }}>
                          <ListItemContent>
                            <div className="mb-2 flex items-center gap-2">
                              <Button
                                variant="soft"
                                color="neutral"
                                size="sm"
                                sx={{ cursor: "default" }}
                              >
                                {resultComponent.sourceNumber}
                              </Button>
                              <div>
                                <Typography>
                                  {resultComponent.documentTitle}
                                </Typography>
                                <Typography level="body-sm" noWrap>
                                  Score: {resultComponent.score.toFixed(3)}
                                </Typography>
                              </div>
                            </div>
                            <Sheet
                              variant="soft"
                              sx={{ borderRadius: 10, p: 2 }}
                            >
                              <p className="overflow-auto whitespace-pre-wrap">
                                {resultComponent.result}
                              </p>
                            </Sheet>
                          </ListItemContent>
                        </ListItem>
                      ))}
                    </List>
                  </>
                ),
              )}
          </div>
        </ModalDialog>
      </Modal>
      <Chip
        variant="outlined"
        className="whitespace-nowrap"
        sx={{ px: 1.5, py: 0.5 }}
        startDecorator={<TextSnippetIcon color="primary" />}
        onClick={() => results.queries != null && setOpen(true)}
      >
        {knowledgeCollection.name}
        {results.queries &&
          ` (${t("knowledgeBase.results", { count: numResults })})`}
      </Chip>
    </>
  );
}
