use reqwest::Client;
use serde::Deserialize;
use sqlx::SqlitePool;

use crate::db::repos::provider_keys::effective_key;

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ProviderModel {
    pub id: String,
    pub name: String,
    pub description: String,
    pub context_length: Option<u64>,
}

pub async fn fetch_models(pool: &SqlitePool, provider: &str) -> anyhow::Result<Vec<ProviderModel>> {
    match provider {
        "openrouter" => fetch_openrouter(pool).await,
        "openai" => fetch_openai(pool).await,
        "anthropic" => fetch_anthropic(pool).await,
        "gemini" => fetch_gemini(pool).await,
        "perplexity" => fetch_perplexity(pool).await,
        _ => anyhow::bail!("Unknown provider: {provider}"),
    }
}

async fn provider_key(pool: &SqlitePool, provider: &str) -> anyhow::Result<String> {
    effective_key(pool, provider)
        .await?
        .ok_or_else(|| anyhow::anyhow!("{provider} API key not configured"))
}

fn sort_models(models: &mut [ProviderModel]) {
    models.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
}

// --- OpenRouter ---

#[derive(Debug, Deserialize)]
struct OpenRouterModelsResponse {
    data: Vec<OpenRouterModelRaw>,
}

#[derive(Debug, Deserialize)]
struct OpenRouterModelRaw {
    id: String,
    name: String,
    #[serde(default)]
    description: String,
    #[serde(default)]
    context_length: Option<u64>,
    architecture: Option<OpenRouterArchitecture>,
}

#[derive(Debug, Deserialize)]
struct OpenRouterArchitecture {
    #[serde(default)]
    modality: String,
}

async fn fetch_openrouter(pool: &SqlitePool) -> anyhow::Result<Vec<ProviderModel>> {
    let key = provider_key(pool, "openrouter").await?;
    let client = Client::new();
    let response = client
        .get("https://openrouter.ai/api/v1/models")
        .bearer_auth(&key)
        .header("HTTP-Referer", "http://localhost:17890")
        .header("X-Title", "KathaGPT")
        .send()
        .await?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        anyhow::bail!("OpenRouter models request failed ({status}): {body}");
    }

    let payload: OpenRouterModelsResponse = response.json().await?;
    let mut models: Vec<ProviderModel> = payload
        .data
        .into_iter()
        .filter(|raw| {
            let modality = raw
                .architecture
                .as_ref()
                .map(|a| a.modality.as_str())
                .unwrap_or("text->text");
            modality.contains("->text") || modality.contains("->multimodal")
        })
        .map(|raw| ProviderModel {
            id: raw.id,
            name: raw.name,
            description: raw.description,
            context_length: raw.context_length,
        })
        .collect();
    sort_models(&mut models);
    Ok(models)
}

// --- OpenAI ---

#[derive(Debug, Deserialize)]
struct OpenAiModelsResponse {
    data: Vec<OpenAiModelRaw>,
}

#[derive(Debug, Deserialize)]
struct OpenAiModelRaw {
    id: String,
}

fn is_openai_chat_model(id: &str) -> bool {
    let id = id.to_lowercase();
    if id.contains("embedding")
        || id.contains("tts")
        || id.contains("whisper")
        || id.contains("dall-e")
        || id.contains("davinci")
        || id.contains("babbage")
        || id.contains("curie")
        || id.starts_with("ft:")
        || id.contains("audio")
        || id.contains("realtime")
        || id.contains("transcribe")
        || id.contains("moderation")
        || id.contains("computer-use")
        || id.contains("sora")
    {
        return false;
    }
    id.starts_with("gpt-")
        || id.starts_with("o1")
        || id.starts_with("o3")
        || id.starts_with("o4")
        || id.starts_with("chatgpt")
}

async fn fetch_openai(pool: &SqlitePool) -> anyhow::Result<Vec<ProviderModel>> {
    let key = provider_key(pool, "openai").await?;
    let client = Client::new();
    let response = client
        .get("https://api.openai.com/v1/models")
        .bearer_auth(&key)
        .send()
        .await?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        anyhow::bail!("OpenAI models request failed ({status}): {body}");
    }

    let payload: OpenAiModelsResponse = response.json().await?;
    let mut models: Vec<ProviderModel> = payload
        .data
        .into_iter()
        .filter(|m| is_openai_chat_model(&m.id))
        .map(|m| ProviderModel {
            name: m.id.clone(),
            id: m.id,
            description: String::new(),
            context_length: None,
        })
        .collect();
    sort_models(&mut models);
    Ok(models)
}

// --- Anthropic ---

#[derive(Debug, Deserialize)]
struct AnthropicModelsResponse {
    data: Vec<AnthropicModelRaw>,
}

#[derive(Debug, Deserialize)]
struct AnthropicModelRaw {
    id: String,
    #[serde(default)]
    display_name: String,
}

async fn fetch_anthropic(pool: &SqlitePool) -> anyhow::Result<Vec<ProviderModel>> {
    let key = provider_key(pool, "anthropic").await?;
    let client = Client::new();
    let response = client
        .get("https://api.anthropic.com/v1/models")
        .header("x-api-key", &key)
        .header("anthropic-version", "2023-06-01")
        .send()
        .await?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        anyhow::bail!("Anthropic models request failed ({status}): {body}");
    }

    let payload: AnthropicModelsResponse = response.json().await?;
    let mut models: Vec<ProviderModel> = payload
        .data
        .into_iter()
        .map(|m| ProviderModel {
            name: if m.display_name.is_empty() {
                m.id.clone()
            } else {
                m.display_name
            },
            id: m.id,
            description: String::new(),
            context_length: None,
        })
        .collect();
    sort_models(&mut models);
    Ok(models)
}

// --- Gemini ---

#[derive(Debug, Deserialize)]
struct GeminiModelsResponse {
    models: Vec<GeminiModelRaw>,
}

#[derive(Debug, Deserialize)]
struct GeminiModelRaw {
    name: String,
    #[serde(default)]
    display_name: String,
    #[serde(default)]
    description: String,
    #[serde(default, rename = "inputTokenLimit")]
    input_token_limit: Option<u64>,
    #[serde(default, rename = "supportedGenerationMethods")]
    supported_generation_methods: Vec<String>,
}

async fn fetch_gemini(pool: &SqlitePool) -> anyhow::Result<Vec<ProviderModel>> {
    let key = provider_key(pool, "gemini").await?;
    let client = Client::new();
    let response = client
        .get(format!(
            "https://generativelanguage.googleapis.com/v1beta/models?key={key}"
        ))
        .send()
        .await?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        anyhow::bail!("Gemini models request failed ({status}): {body}");
    }

    let payload: GeminiModelsResponse = response.json().await?;
    let mut models: Vec<ProviderModel> = payload
        .models
        .into_iter()
        .filter(|m| {
            m.supported_generation_methods
                .iter()
                .any(|method| method == "generateContent")
                && m.name.contains("gemini")
                && !m.name.contains("embedding")
                && !m.name.contains("aqa")
                && !m.name.contains("imagen")
        })
        .map(|m| {
            let id = m
                .name
                .strip_prefix("models/")
                .unwrap_or(&m.name)
                .to_string();
            ProviderModel {
                name: if m.display_name.is_empty() {
                    id.clone()
                } else {
                    m.display_name
                },
                id,
                description: m.description,
                context_length: m.input_token_limit,
            }
        })
        .collect();
    sort_models(&mut models);
    Ok(models)
}

// --- Perplexity (no public models API — curated list) ---

const PERPLEXITY_MODELS: &[(&str, &str, &str)] = &[
    ("sonar", "Sonar", "Fast online answers"),
    ("sonar-pro", "Sonar Pro", "Advanced online research"),
    (
        "sonar-reasoning",
        "Sonar Reasoning",
        "Reasoning with web search",
    ),
    (
        "sonar-reasoning-pro",
        "Sonar Reasoning Pro",
        "Deep reasoning with web search",
    ),
    (
        "sonar-deep-research",
        "Sonar Deep Research",
        "Exhaustive research reports",
    ),
];

async fn fetch_perplexity(pool: &SqlitePool) -> anyhow::Result<Vec<ProviderModel>> {
    let _key = provider_key(pool, "perplexity").await?;
    let mut models: Vec<ProviderModel> = PERPLEXITY_MODELS
        .iter()
        .map(|(id, name, description)| ProviderModel {
            id: (*id).to_string(),
            name: (*name).to_string(),
            description: (*description).to_string(),
            context_length: None,
        })
        .collect();
    sort_models(&mut models);
    Ok(models)
}
