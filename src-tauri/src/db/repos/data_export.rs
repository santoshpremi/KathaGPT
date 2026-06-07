use serde_json::{json, Value};
use sqlx::SqlitePool;

pub async fn export_snapshot(pool: &SqlitePool) -> anyhow::Result<Value> {
    let user = sqlx::query_as::<_, (String, Option<String>, Option<String>, Option<String>, String, String, i64)>(
        "SELECT id, first_name, last_name, email, locale, default_model, accepted_guidelines FROM user_profile",
    )
    .fetch_all(pool)
    .await?;

    let chats = sqlx::query_as::<_, (String, Option<String>, Option<String>, String, String)>(
        "SELECT id, name, model_override, created_at, updated_at FROM chats",
    )
    .fetch_all(pool)
    .await?;

    let messages = sqlx::query_as::<_, (String, String, String, i64, Option<String>, String)>(
        "SELECT id, chat_id, content, from_ai, generation_model, created_at FROM messages",
    )
    .fetch_all(pool)
    .await?;

    let workflows = sqlx::query_as::<_, (String, String, Option<String>, String, i32, String, String, String)>(
        "SELECT id, name, description, department_id, index_pos, steps, created_at, updated_at FROM workflows",
    )
    .fetch_all(pool)
    .await?;

    Ok(json!({
        "version": 1,
        "exportedAt": chrono::Utc::now().to_rfc3339(),
        "userProfile": user.into_iter().map(|u| json!({
            "id": u.0, "firstName": u.1, "lastName": u.2, "email": u.3,
            "locale": u.4, "defaultModel": u.5, "acceptedGuidelines": u.6 != 0,
        })).collect::<Vec<_>>(),
        "chats": chats.into_iter().map(|c| json!({
            "id": c.0, "name": c.1, "modelOverride": c.2,
            "createdAt": c.3, "updatedAt": c.4,
        })).collect::<Vec<_>>(),
        "messages": messages.into_iter().map(|m| json!({
            "id": m.0, "chatId": m.1, "content": m.2,
            "fromAi": m.3 != 0, "generationModel": m.4, "createdAt": m.5,
        })).collect::<Vec<_>>(),
        "workflows": workflows.into_iter().map(|w| json!({
            "id": w.0, "name": w.1, "description": w.2, "departmentId": w.3,
            "index": w.4, "steps": serde_json::from_str::<Value>(&w.5).unwrap_or(json!([])),
            "createdAt": w.6, "updatedAt": w.7,
        })).collect::<Vec<_>>(),
    }))
}

pub async fn import_snapshot(pool: &SqlitePool, data: &Value) -> anyhow::Result<serde_json::Value> {
    let mut imported = json!({ "chats": 0, "messages": 0, "workflows": 0 });

    if let Some(chats) = data.get("chats").and_then(|v| v.as_array()) {
        for chat in chats {
            let id = chat["id"].as_str().unwrap_or_default();
            if id.is_empty() {
                continue;
            }
            sqlx::query(
                "INSERT OR REPLACE INTO chats (id, name, model_override, created_at, updated_at, hidden, rag_mode)
                 VALUES (?, ?, ?, ?, ?, 0, 'OFF')",
            )
            .bind(id)
            .bind(chat["name"].as_str())
            .bind(chat["modelOverride"].as_str())
            .bind(chat["createdAt"].as_str().unwrap_or(""))
            .bind(chat["updatedAt"].as_str().unwrap_or(""))
            .execute(pool)
            .await?;
            imported["chats"] = json!(imported["chats"].as_i64().unwrap_or(0) + 1);
        }
    }

    if let Some(messages) = data.get("messages").and_then(|v| v.as_array()) {
        for msg in messages {
            let id = msg["id"].as_str().unwrap_or_default();
            let chat_id = msg["chatId"].as_str().unwrap_or_default();
            if id.is_empty() || chat_id.is_empty() {
                continue;
            }
            sqlx::query(
                "INSERT OR REPLACE INTO messages (id, chat_id, content, from_ai, generation_model, created_at, response_completed, cancelled)
                 VALUES (?, ?, ?, ?, ?, ?, 1, 0)",
            )
            .bind(id)
            .bind(chat_id)
            .bind(msg["content"].as_str().unwrap_or(""))
            .bind(if msg["fromAi"].as_bool().unwrap_or(false) { 1 } else { 0 })
            .bind(msg["generationModel"].as_str())
            .bind(msg["createdAt"].as_str().unwrap_or(""))
            .execute(pool)
            .await?;
            imported["messages"] = json!(imported["messages"].as_i64().unwrap_or(0) + 1);
        }
    }

    if let Some(workflows) = data.get("workflows").and_then(|v| v.as_array()) {
        for wf in workflows {
            let id = wf["id"].as_str().unwrap_or_default();
            if id.is_empty() {
                continue;
            }
            let steps = wf.get("steps").cloned().unwrap_or(json!([]));
            sqlx::query(
                "INSERT OR REPLACE INTO workflows (id, name, description, department_id, index_pos, steps, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            )
            .bind(id)
            .bind(wf["name"].as_str().unwrap_or("Workflow"))
            .bind(wf["description"].as_str())
            .bind(wf["departmentId"].as_str().unwrap_or("personal"))
            .bind(wf["index"].as_i64().unwrap_or(0) as i32)
            .bind(steps.to_string())
            .bind(wf["createdAt"].as_str().unwrap_or(""))
            .bind(wf["updatedAt"].as_str().unwrap_or(""))
            .execute(pool)
            .await?;
            imported["workflows"] = json!(imported["workflows"].as_i64().unwrap_or(0) + 1);
        }
    }

    Ok(imported)
}
