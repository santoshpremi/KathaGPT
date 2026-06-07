import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useQuery } from "@tanstack/react-query";
import { Stack } from "@mui/joy";
import { AnimatePresence, motion } from "framer-motion";
import ArtifactCanvas from "./ArtifactCanvas";
import type { Artifact } from "@shared/api/chat/artifact/artifactTypes";
import {
  createArtifactVersion,
  getChatArtifact,
} from "../../lib/api/rust/artifacts";

interface ArtifactProviderMethods {
  visible: boolean;
  isLoading: boolean;
  artifact: Artifact | undefined;
  versionIndex: number;
  hide: () => void;
  showArtifact: (versionId?: string) => void;
  createNewVersion: ({
    highlightedText,
    feedback,
    context,
  }: {
    highlightedText: string;
    feedback: string;
    context: string | null;
  }) => void;
}

const ArtifactContext = createContext<ArtifactProviderMethods | null>(null);

interface ArtifactContextProps {
  chatId: string;
  children: React.ReactNode;
  embedded?: boolean;
}

export const ArtifactProvider = ({
  children,
  chatId,
  embedded = false,
}: ArtifactContextProps) => {
  const [versionIndex, setVersionIndex] = useState<number>(0);
  const [visible, setVisible] = useState<boolean>(false);
  const [artifact, setArtifact] = useState<Artifact | undefined>();
  const [loading, setLoading] = useState<boolean>(false);

  const { data, isLoading: artifactLoading } = useQuery({
    queryKey: ["artifact", chatId],
    queryFn: () => getChatArtifact(chatId),
    staleTime: Infinity,
    retry: false,
  });

  const isLoading = artifactLoading || loading;

  useEffect(() => {
    if (!data) {
      setArtifact(undefined);
      return;
    }
    setArtifact(data);
  }, [data]);

  const show = useCallback(
    (versionId?: string) => {
      setVisible(true);
      const index = artifact?.versions.findIndex((v) => v.id === versionId);
      setVersionIndex(index ?? -1);
    },
    [artifact, setVersionIndex],
  );

  const hide = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  const createNewVersion = useCallback(
    async (input: {
      highlightedText: string;
      feedback: string;
      context: string | null;
    }) => {
      if (!artifact) return;
      setLoading(true);
      try {
        const content = [
          input.context,
          input.highlightedText,
          input.feedback,
        ]
          .filter(Boolean)
          .join("\n\n");
        const version = await createArtifactVersion(artifact.id, {
          content,
          fromChat: false,
        });
        setArtifact((prev) =>
          prev
            ? {
                ...prev,
                versions: [
                  ...prev.versions,
                  {
                    id: version.id,
                    content: version.content,
                    createdAt: version.createdAt,
                    fromChat: version.fromChat,
                    version: version.version,
                  },
                ],
              }
            : prev,
        );
        setVersionIndex(artifact.versions.length);
        setVisible(true);
      } finally {
        setLoading(false);
      }
    },
    [artifact],
  );

  const value: ArtifactProviderMethods = useMemo(
    () => ({
      visible,
      artifact: artifact ?? undefined,
      versionIndex,
      createNewVersion,
      isLoading,
      hide,
      showArtifact: show,
    }),
    [visible, artifact, versionIndex, isLoading, createNewVersion, hide, show],
  );

  return (
    <ArtifactContext.Provider value={value}>
      <Stack
        direction="row"
        sx={{ width: "100%", height: "100%", minWidth: 0, flex: 1 }}
      >
        <Stack
          sx={{
            flex: 1,
            minWidth: 0,
            width: "100%",
            height: "100%",
            overflow: "auto",
          }}
        >
          {children}
        </Stack>
        <AnimatePresence>
          {artifact && visible && (
            <>
              {embedded && (
                <motion.div
                  onClick={hide}
                  className="fixed bottom-0 left-0 right-0 top-0 z-40 h-screen w-full bg-black/40"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
              <ArtifactCanvas embedded={embedded} />
            </>
          )}
        </AnimatePresence>
      </Stack>
    </ArtifactContext.Provider>
  );
};

export const useArtifact = () => {
  const context = useContext(ArtifactContext);
  if (!context) {
    throw new Error("useArtifact must be used within an ArtifactProvider");
  }
  return context;
};
