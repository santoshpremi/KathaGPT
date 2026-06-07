use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

pub const DEFAULT_MODEL: &str = "gpt-4o-mini";

pub const ENABLED_MODELS: &[&str] = &[
    "gpt-4o",
    "gpt-4o-mini",
    "o1-us",
    "o3-mini",
    "sonar",
    "sonar-deep-research",
    "claude-3-7-sonnet",
    "claude-3-7-sonnet-thinking",
    "gemini-1.5-pro",
    "gemini-2.0-flash",
    "llama-3.3-fast",
    "deepseek-v3",
    "deepseek-r1",
];

pub fn openrouter_slug(model: &str) -> Option<&'static str> {
    match model {
        "gpt-4o-mini" => Some("openai/gpt-4o-mini"),
        "gpt-4o" => Some("openai/gpt-4o"),
        "sonar" => Some("perplexity/sonar"),
        "sonar-deep-research" => Some("perplexity/sonar-deep-research"),
        "claude-3-7-sonnet" => Some("anthropic/claude-3.7-sonnet"),
        "claude-3-7-sonnet-thinking" => Some("anthropic/claude-3.7-sonnet:thinking"),
        "gemini-1.5-pro" => Some("google/gemini-pro-1.5"),
        "gemini-2.0-flash" => Some("google/gemini-2.0-flash-001"),
        "o1-us" => Some("openai/o1"),
        "o3-mini" => Some("openai/o3-mini"),
        "llama-3.3-fast" => Some("meta-llama/llama-3.3-70b-instruct"),
        "deepseek-v3" => Some("deepseek/deepseek-chat"),
        "deepseek-r1" => Some("deepseek/deepseek-r1"),
        _ => None,
    }
}

pub struct DirectModel {
    pub provider: &'static str,
    pub slug: &'static str,
}

pub fn direct_model(model: &str) -> Option<DirectModel> {
    match model {
        "gpt-4o-mini" => Some(DirectModel { provider: "openai", slug: "gpt-4o-mini" }),
        "gpt-4o" => Some(DirectModel { provider: "openai", slug: "gpt-4o" }),
        "o1-us" => Some(DirectModel { provider: "openai", slug: "o1" }),
        "o3-mini" => Some(DirectModel { provider: "openai", slug: "o3-mini" }),
        "claude-3-7-sonnet" => Some(DirectModel {
            provider: "anthropic",
            slug: "claude-3-5-sonnet-20241022",
        }),
        "claude-3-7-sonnet-thinking" => Some(DirectModel {
            provider: "anthropic",
            slug: "claude-3-5-sonnet-20241022",
        }),
        "gemini-1.5-pro" => Some(DirectModel {
            provider: "gemini",
            slug: "gemini-1.5-pro",
        }),
        "gemini-2.0-flash" => Some(DirectModel {
            provider: "gemini",
            slug: "gemini-2.0-flash",
        }),
        "sonar" => Some(DirectModel {
            provider: "perplexity",
            slug: "sonar",
        }),
        "sonar-deep-research" => Some(DirectModel {
            provider: "perplexity",
            slug: "sonar-deep-research",
        }),
        _ => None,
    }
}
