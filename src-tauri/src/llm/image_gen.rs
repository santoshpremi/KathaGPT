use reqwest::Client;
use serde::Deserialize;
use sqlx::SqlitePool;

use crate::db::repos::provider_keys::effective_key;

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ImageModel {
    pub id: String,
    pub name: String,
    pub description: String,
    pub provider: String,
}

#[derive(Debug, Clone, serde::Serialize)]
#[serde(rename_all = "camelCase")]
pub struct GeneratedImage {
    pub url: String,
    pub revised_prompt: Option<String>,
}

fn style_suffix(style: &str) -> &'static str {
    match style {
        "advertising" => " Style: polished advertising material, campaign-ready.",
        "illustration" => " Style: professional digital illustration.",
        "interior" => " Style: interior design visualization, architectural.",
        "logo" => " Style: clean logo design on plain background.",
        "memphis" => " Style: Memphis design, bold geometric shapes and colors.",
        "minimalist" => " Style: minimalist, clean, simple composition.",
        "mockup" => " Style: realistic product mockup.",
        "product" => " Style: product presentation, studio lighting.",
        "realistic" => " Style: photorealistic, high detail.",
        "social" => " Style: social media graphic, eye-catching.",
        "stock" => " Style: stock photo, natural lighting.",
        "ui" => " Style: UI mockup, modern app interface.",
        _ => "",
    }
}

fn aspect_hint(aspect: &str) -> &'static str {
    match aspect {
        "landscape" => " Compose as a wide landscape image (16:9 aspect ratio).",
        "portrait" => " Compose as a tall portrait image (9:16 aspect ratio).",
        _ => " Compose as a square image (1:1 aspect ratio).",
    }
}

pub fn build_image_prompt(prompt: &str, style: Option<&str>, aspect: Option<&str>) -> String {
    let mut out = prompt.trim().to_string();
    if let Some(s) = style.filter(|s| *s != "none" && !s.is_empty()) {
        out.push_str(style_suffix(s));
    }
    if let Some(a) = aspect {
        out.push_str(aspect_hint(a));
    }
    out
}

fn outputs_images(modality: &str) -> bool {
    modality
        .to_lowercase()
        .split_once("->")
        .is_some_and(|(_, outputs)| outputs.contains("image"))
}

fn curated_openrouter_image_models() -> Vec<ImageModel> {
    [
        (
            "google/gemini-2.5-flash-image",
            "Gemini 2.5 Flash Image",
            "Google image generation (Nano Banana).",
        ),
        (
            "google/gemini-3-pro-image-preview",
            "Gemini 3 Pro Image Preview",
            "Google flagship image model (Nano Banana Pro).",
        ),
        (
            "google/gemini-3.1-flash-image-preview",
            "Gemini 3.1 Flash Image Preview",
            "Google fast image model (Nano Banana 2).",
        ),
    ]
    .into_iter()
    .map(|(id, name, description)| ImageModel {
        id: format!("openrouter:{id}"),
        name: name.to_string(),
        description: description.to_string(),
        provider: "openrouter".to_string(),
    })
    .collect()
}

pub async fn list_image_models(pool: &SqlitePool) -> anyhow::Result<Vec<ImageModel>> {
    let mut models = Vec::new();

    if effective_key(pool, "openrouter").await?.is_some() {
        match fetch_openrouter_image_models(pool).await {
            Ok(mut openrouter) => {
                if openrouter.is_empty() {
                    openrouter = curated_openrouter_image_models();
                }
                models.append(&mut openrouter);
            }
            Err(err) => {
                tracing::warn!("OpenRouter image models fetch failed: {err}");
                models.append(&mut curated_openrouter_image_models());
            }
        }
    }

    if effective_key(pool, "openai").await?.is_some() {
        models.push(ImageModel {
            id: "openai:dall-e-3".to_string(),
            name: "DALL·E 3".to_string(),
            description: "OpenAI image generation model.".to_string(),
            provider: "openai".to_string(),
        });
        models.push(ImageModel {
            id: "openai:dall-e-2".to_string(),
            name: "DALL·E 2".to_string(),
            description: "OpenAI image generation model.".to_string(),
            provider: "openai".to_string(),
        });
    }

    models.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));
    Ok(models)
}

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
    architecture: Option<OpenRouterArchitecture>,
}

#[derive(Debug, Deserialize)]
struct OpenRouterArchitecture {
    #[serde(default)]
    modality: String,
}

async fn fetch_openrouter_image_models(pool: &SqlitePool) -> anyhow::Result<Vec<ImageModel>> {
    let key = effective_key(pool, "openrouter")
        .await?
        .ok_or_else(|| anyhow::anyhow!("OpenRouter API key not configured"))?;
    let client = Client::new();
    let response = client
        .get("https://openrouter.ai/api/v1/models")
        .bearer_auth(&key)
        .header("HTTP-Referer", "http://localhost:17890")
        .header("X-Title", "KathGPT")
        .send()
        .await?;

    if !response.status().is_success() {
        let status = response.status();
        let body = response.text().await.unwrap_or_default();
        anyhow::bail!("OpenRouter models request failed ({status}): {body}");
    }

    let payload: OpenRouterModelsResponse = response.json().await?;
    let models = payload
        .data
        .into_iter()
        .filter(|raw| {
            let modality = raw
                .architecture
                .as_ref()
                .map(|a| a.modality.as_str())
                .unwrap_or("");
            outputs_images(modality)
        })
        .map(|raw| ImageModel {
            id: format!("openrouter:{}", raw.id),
            name: raw.name,
            description: raw.description,
            provider: "openrouter".to_string(),
        })
        .collect();
    Ok(models)
}

fn parse_prefixed_model(model: &str) -> Option<(&str, &str)> {
    for provider in ["openrouter", "openai"] {
        let prefix = format!("{provider}:");
        if let Some(slug) = model.strip_prefix(&prefix) {
            if !slug.is_empty() {
                return Some((provider, slug));
            }
        }
    }
    None
}

fn openai_size(aspect: Option<&str>) -> &'static str {
    match aspect {
        Some("landscape") => "1792x1024",
        Some("portrait") => "1024x1792",
        _ => "1024x1024",
    }
}

pub async fn generate_images(
    pool: &SqlitePool,
    model: &str,
    prompt: &str,
    style: Option<&str>,
    aspect: Option<&str>,
    count: u32,
) -> anyhow::Result<Vec<GeneratedImage>> {
    let count = count.clamp(1, 4);
    let full_prompt = build_image_prompt(prompt, style, aspect);
    let (provider, slug) = parse_prefixed_model(model)
        .ok_or_else(|| anyhow::anyhow!("Invalid image model id: {model}"))?;

    let mut images = Vec::new();
    for _ in 0..count {
        let generated = match provider {
            "openrouter" => {
                generate_openrouter(pool, slug, &full_prompt).await?
            }
            "openai" => generate_openai(pool, slug, &full_prompt, aspect).await?,
            _ => anyhow::bail!("Unsupported image provider: {provider}"),
        };
        images.push(generated);
    }
    Ok(images)
}

async fn generate_openrouter(
    pool: &SqlitePool,
    model: &str,
    prompt: &str,
) -> anyhow::Result<GeneratedImage> {
    let key = effective_key(pool, "openrouter")
        .await?
        .ok_or_else(|| anyhow::anyhow!("OpenRouter API key not configured"))?;
    let client = Client::new();
    let body = serde_json::json!({
        "model": model,
        "messages": [{ "role": "user", "content": prompt }],
        "modalities": ["image", "text"],
    });

    let response = client
        .post("https://openrouter.ai/api/v1/chat/completions")
        .bearer_auth(&key)
        .header("HTTP-Referer", "http://localhost:17890")
        .header("X-Title", "KathGPT")
        .json(&body)
        .send()
        .await?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        anyhow::bail!("Image generation failed ({status}): {text}");
    }

    let payload: serde_json::Value = response.json().await?;
    extract_image_from_chat_response(&payload)
}

async fn generate_openai(
    pool: &SqlitePool,
    model: &str,
    prompt: &str,
    aspect: Option<&str>,
) -> anyhow::Result<GeneratedImage> {
    let key = effective_key(pool, "openai")
        .await?
        .ok_or_else(|| anyhow::anyhow!("OpenAI API key not configured"))?;
    let client = Client::new();
    let body = serde_json::json!({
        "model": model,
        "prompt": prompt,
        "n": 1,
        "size": openai_size(aspect),
        "response_format": "b64_json",
    });

    let response = client
        .post("https://api.openai.com/v1/images/generations")
        .bearer_auth(&key)
        .json(&body)
        .send()
        .await?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        anyhow::bail!("OpenAI image generation failed ({status}): {text}");
    }

    let payload: serde_json::Value = response.json().await?;
    let b64 = payload["data"][0]["b64_json"]
        .as_str()
        .ok_or_else(|| anyhow::anyhow!("No image data in OpenAI response"))?;
    let revised = payload["data"][0]["revised_prompt"]
        .as_str()
        .map(str::to_string);
    Ok(GeneratedImage {
        url: format!("data:image/png;base64,{b64}"),
        revised_prompt: revised,
    })
}

fn extract_image_from_chat_response(payload: &serde_json::Value) -> anyhow::Result<GeneratedImage> {
    let message = &payload["choices"][0]["message"];

    if let Some(images) = message["images"].as_array() {
        for image in images {
            if let Some(url) = image["image_url"]["url"].as_str() {
                return Ok(GeneratedImage {
                    url: url.to_string(),
                    revised_prompt: None,
                });
            }
            if let Some(url) = image["url"].as_str() {
                return Ok(GeneratedImage {
                    url: url.to_string(),
                    revised_prompt: None,
                });
            }
        }
    }

    if let Some(content) = message["content"].as_str() {
        if let Some(url) = extract_data_url(content) {
            return Ok(GeneratedImage {
                url,
                revised_prompt: None,
            });
        }
    }

    if let Some(array) = message["content"].as_array() {
        for part in array {
            if let Some(url) = part["image_url"]["url"].as_str() {
                return Ok(GeneratedImage {
                    url: url.to_string(),
                    revised_prompt: None,
                });
            }
        }
    }

    anyhow::bail!("No image found in model response")
}

fn extract_data_url(text: &str) -> Option<String> {
    if text.starts_with("data:image/") {
        return Some(text.to_string());
    }
    for word in text.split_whitespace() {
        if word.starts_with("data:image/") {
            return Some(word.trim_matches(|c| c == ')' || c == ']').to_string());
        }
        if word.starts_with("http") && (word.contains(".png") || word.contains(".jpg") || word.contains(".webp")) {
            return Some(word.trim_matches(|c| c == ')' || c == ']').to_string());
        }
    }
    None
}

pub async fn improve_prompt(pool: &SqlitePool, prompt: &str) -> anyhow::Result<String> {
    let openrouter_key = effective_key(pool, "openrouter").await?;
    let openai_key = effective_key(pool, "openai").await?;
    let use_openrouter = openrouter_key.is_some();
    let key = openrouter_key
        .or(openai_key)
        .ok_or_else(|| anyhow::anyhow!("Configure OpenRouter or OpenAI API key to improve prompts"))?;
    let (url, model, headers): (&str, &str, Vec<(&str, &str)>) = if use_openrouter {
        (
            "https://openrouter.ai/api/v1/chat/completions",
            "openai/gpt-4o-mini",
            vec![
                ("HTTP-Referer", "http://localhost:17890"),
                ("X-Title", "KathGPT"),
            ],
        )
    } else {
        ("https://api.openai.com/v1/chat/completions", "gpt-4o-mini", vec![])
    };

    let client = Client::new();
    let body = serde_json::json!({
        "model": model,
        "messages": [
            {
                "role": "system",
                "content": "Improve the user's image generation prompt. Return only the improved prompt, no explanation. Keep it concise but vivid."
            },
            { "role": "user", "content": prompt }
        ],
        "max_tokens": 300,
        "temperature": 0.7,
    });

    let mut req = client.post(url).bearer_auth(&key).json(&body);
    for (k, v) in headers {
        req = req.header(k, v);
    }

    let response = req.send().await?;
    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        anyhow::bail!("Improve prompt failed ({status}): {text}");
    }

    let payload: serde_json::Value = response.json().await?;
    let improved = payload["choices"][0]["message"]["content"]
        .as_str()
        .ok_or_else(|| anyhow::anyhow!("No improved prompt in response"))?
        .trim()
        .to_string();
    Ok(improved)
}
