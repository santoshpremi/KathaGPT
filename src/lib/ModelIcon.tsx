import type { HTMLProps } from "react";
import type { ModelOverride } from "@backend/api/chat/chatTypes";
import kathagptIcon from "../assets/logo.svg";
import claudeIcon from "../assets/modelicons/openai.png";
import googleIcon from "../assets/modelicons/openai.png";
import openaiIcon from "../assets/modelicons/openai.png";
import perplexityIcon from "../assets/modelicons/openai.png";
import nebiusIcon from "../assets/modelicons/openai.png";
import deepseekIcon from "../assets/modelicons/openai.png";

export function ModelIcon({
  modelName,
  ...props
}: {
  modelName: ModelOverride;
} & HTMLProps<HTMLImageElement>) {
  let src: string | undefined;

  const model = modelName.toLowerCase();

  if (modelName === "automatic") {
    src = kathagptIcon;
  } else if (model.includes("llama")) {
    src = nebiusIcon;
  } else if (model.includes("deepseek")) {
    src = deepseekIcon;
  } else if (model.includes("online") || model.includes("sonar")) {
    src = perplexityIcon;
  } else if (model.includes("gpt-")) {
    src = openaiIcon;
  } else if (model.includes("claude")) {
    src = claudeIcon;
  } else if (model.includes("gemini")) {
    src = googleIcon;
  } else {
    src = openaiIcon;
  }
  return <img src={src} alt={modelName + " icon"} {...props} />;
}
