import { Button, Card, Typography } from "@mui/joy";
import { useNavigate, useParams } from "../../router";
import { useOrganizationApi } from "../../lib/hooks/useApi";
import { useMutateMe } from "../../lib/api/user";
import { useTranslation } from "../../lib/i18n";

export default function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams("/:organizationId");
  const api = useOrganizationApi();
  const mutateMe = useMutateMe();

  const complete = async () => {
    await api.patch("/users/me", { onboarded: true });
    await mutateMe();
    void navigate("/:organizationId", {
      params: { organizationId: params.organizationId },
      replace: true,
    });
  };

  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <Card className="!max-w-lg !p-8 !text-center">
        <Typography level="h3" className="!mb-2">
          Welcome to KathaGPT
        </Typography>
        <Typography level="body-md" className="!mb-6">
          Get started with AI-powered chat, workflows, and tools for your team.
        </Typography>
        <Button onClick={() => void complete()}>{t("next")}</Button>
      </Card>
    </div>
  );
}
