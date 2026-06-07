import { Description } from "@mui/icons-material";
import { useQuery } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { useArtifact } from "./ArtifactProvider";
import { getArtifactVersionPreview } from "../../lib/api/rust/artifacts";
import ReferenceContainer from "../chat/MessageReferences";
import { ARTIFACT_PREVIEW_ID } from "../../lib/testIds";

interface ArtifactPreviewProps {
  id: string | null;
}
export function ArtifactPreview({ id }: ArtifactPreviewProps) {
  const { showArtifact } = useArtifact();
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ["artifactVersion", id],
    queryFn: () => getArtifactVersionPreview(id!),
    enabled: !!id,
    staleTime: Infinity,
  });

  return (
    <ReferenceContainer
      testId={ARTIFACT_PREVIEW_ID}
      title={data?.title ?? ""}
      subtitle={t("artifact.clickToOpen")}
      isLoading={isLoading || !id}
      onClick={id ? () => showArtifact(id) : undefined}
      icon={<Description />}
    />
  );
}
