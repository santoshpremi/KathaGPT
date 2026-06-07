import { Button, Card, Input, Step, StepIndicator, Stepper, Typography } from "@mui/joy";
import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "../router";
import { useSetProviderKey, useTestProviderConnection } from "../lib/api/rust";
import { DEV_ORG_ID } from "../lib/local/seed";
import { useTranslation } from "../lib/i18n";

export default function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [apiKey, setApiKey] = useState("");
  const { mutateAsync: setKey, isPending: saving } = useSetProviderKey();
  const { mutateAsync: testKey, isPending: testing } = useTestProviderConnection();

  const finish = () => {
    localStorage.setItem("kathagpt_onboarded", "true");
    void navigate("/:organizationId", {
      params: { organizationId: DEV_ORG_ID },
      replace: true,
    });
  };

  const handleTestAndSave = async () => {
    if (apiKey.trim().length < 8) {
      toast.error("Enter a valid API key (at least 8 characters)");
      return;
    }
    try {
      const result = await testKey({ provider: "openrouter", apiKey: apiKey.trim() });
      if (!result.ok) {
        toast.error(result.message || "Connection failed");
        return;
      }
      await setKey({ provider: "openrouter", apiKey: apiKey.trim() });
      toast.success("API key saved");
      setStep(2);
    } catch {
      toast.error("Could not verify API key");
    }
  };

  return (
    <div className="flex h-full w-full items-center justify-center p-6">
      <Card className="!w-full !max-w-lg !p-8">
        <Stepper sx={{ mb: 4 }}>
          <Step indicator={<StepIndicator>1</StepIndicator>}>Welcome</Step>
          <Step indicator={<StepIndicator>2</StepIndicator>}>API Key</Step>
          <Step indicator={<StepIndicator>3</StepIndicator>}>Done</Step>
        </Stepper>

        {step === 0 && (
          <>
            <Typography level="h3" className="!mb-2">
              Welcome to KathaGPT
            </Typography>
            <Typography level="body-md" className="!mb-6">
              Private AI chat on your machine. Your data stays local — only LLM
              requests leave your computer.
            </Typography>
            <Button onClick={() => setStep(1)}>{t("next", "Next")}</Button>
          </>
        )}

        {step === 1 && (
          <>
            <Typography level="h4" className="!mb-2">
              Connect OpenRouter
            </Typography>
            <Typography level="body-sm" className="!mb-4 text-gray-500">
              Get a free key at openrouter.ai — it routes to GPT, Claude, Gemini,
              and more.
            </Typography>
            <Input
              placeholder="sk-or-..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              type="password"
              className="!mb-4"
            />
            <div className="flex gap-2">
              <Button variant="outlined" onClick={() => setStep(0)}>
                {t("back", "Back")}
              </Button>
              <Button
                loading={testing || saving}
                onClick={() => void handleTestAndSave()}
              >
                Test &amp; Save
              </Button>
              <Button variant="plain" onClick={finish}>
                Skip for now
              </Button>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <Typography level="h4" className="!mb-2">
              You&apos;re all set
            </Typography>
            <Typography level="body-md" className="!mb-6">
              Start chatting — your history is saved locally in SQLite.
            </Typography>
            <Button onClick={finish}>{t("startChatting", "Start Chatting")}</Button>
          </>
        )}
      </Card>
    </div>
  );
}
