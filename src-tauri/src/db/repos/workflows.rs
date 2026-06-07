use sqlx::SqlitePool;

use crate::models::{CreateWorkflowRequest, UpdateWorkflowRequest, Workflow, WorkflowStep};

const DEMO_WORKFLOW_ID: &str = "demo";

pub async fn ensure_seed(pool: &SqlitePool) -> anyhow::Result<()> {
    let exists: Option<(i64,)> =
        sqlx::query_as("SELECT 1 FROM workflows WHERE id = ?")
            .bind(DEMO_WORKFLOW_ID)
            .fetch_optional(pool)
            .await?;
    if exists.is_some() {
        return Ok(());
    }

    let now = chrono::Utc::now().to_rfc3339();
    let steps = serde_json::to_string(&[WorkflowStep {
        id: "step1".to_string(),
        order: 0,
        prompt_template: "Hello from the demo workflow.".to_string(),
        model_override: None,
    }])?;

    sqlx::query(
        "INSERT INTO workflows (id, name, description, department_id, index_pos, steps, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(DEMO_WORKFLOW_ID)
    .bind("Demo Workflow")
    .bind("Demo workflow for local edition.")
    .bind("personal")
    .bind(0)
    .bind(steps)
    .bind(&now)
    .bind(&now)
    .execute(pool)
    .await?;

    Ok(())
}

fn row_to_workflow(
    id: String,
    name: String,
    description: Option<String>,
    department_id: String,
    index_pos: i32,
    steps_json: String,
    created_at: String,
    updated_at: String,
) -> anyhow::Result<Workflow> {
    let steps: Vec<WorkflowStep> = serde_json::from_str(&steps_json).unwrap_or_default();
    Ok(Workflow {
        id,
        name,
        description,
        index: index_pos,
        department_id,
        steps,
        created_at,
        updated_at,
    })
}

pub async fn list_all(pool: &SqlitePool) -> anyhow::Result<Vec<Workflow>> {
    let rows: Vec<(
        String,
        String,
        Option<String>,
        String,
        i32,
        String,
        String,
        String,
    )> = sqlx::query_as(
        "SELECT id, name, description, department_id, index_pos, steps, created_at, updated_at
         FROM workflows ORDER BY department_id, index_pos, name",
    )
    .fetch_all(pool)
    .await?;

    rows.into_iter()
        .map(|r| {
            row_to_workflow(r.0, r.1, r.2, r.3, r.4, r.5, r.6, r.7)
        })
        .collect()
}

pub async fn get(pool: &SqlitePool, id: &str) -> anyhow::Result<Option<Workflow>> {
    let row: Option<(
        String,
        String,
        Option<String>,
        String,
        i32,
        String,
        String,
        String,
    )> = sqlx::query_as(
        "SELECT id, name, description, department_id, index_pos, steps, created_at, updated_at
         FROM workflows WHERE id = ?",
    )
    .bind(id)
    .fetch_optional(pool)
    .await?;

    row.map(|r| row_to_workflow(r.0, r.1, r.2, r.3, r.4, r.5, r.6, r.7))
        .transpose()
}

pub async fn create(pool: &SqlitePool, body: &CreateWorkflowRequest) -> anyhow::Result<Workflow> {
    let now = chrono::Utc::now().to_rfc3339();
    let steps = serde_json::to_string(&body.steps)?;
    let (index,): (i32,) = sqlx::query_as(
        "SELECT COALESCE(MAX(index_pos), -1) + 1 FROM workflows WHERE department_id = ?",
    )
    .bind(&body.department_id)
    .fetch_one(pool)
    .await?;

    sqlx::query(
        "INSERT INTO workflows (id, name, description, department_id, index_pos, steps, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    )
    .bind(&body.id)
    .bind(&body.name)
    .bind(&body.description)
    .bind(&body.department_id)
    .bind(index)
    .bind(steps)
    .bind(&now)
    .bind(&now)
    .execute(pool)
    .await?;

    get(pool, &body.id)
        .await?
        .ok_or_else(|| anyhow::anyhow!("Workflow not found after create"))
}

pub async fn update(
    pool: &SqlitePool,
    id: &str,
    body: &UpdateWorkflowRequest,
) -> anyhow::Result<Option<Workflow>> {
    if get(pool, id).await?.is_none() {
        return Ok(None);
    }

    let now = chrono::Utc::now().to_rfc3339();

    if let Some(name) = &body.name {
        sqlx::query("UPDATE workflows SET name = ?, updated_at = ? WHERE id = ?")
            .bind(name)
            .bind(&now)
            .bind(id)
            .execute(pool)
            .await?;
    }
    if body.description.is_some() {
        sqlx::query("UPDATE workflows SET description = ?, updated_at = ? WHERE id = ?")
            .bind(&body.description)
            .bind(&now)
            .bind(id)
            .execute(pool)
            .await?;
    }
    if let Some(dept) = &body.department_id {
        sqlx::query("UPDATE workflows SET department_id = ?, updated_at = ? WHERE id = ?")
            .bind(dept)
            .bind(&now)
            .bind(id)
            .execute(pool)
            .await?;
    }
    if let Some(index) = body.index {
        sqlx::query("UPDATE workflows SET index_pos = ?, updated_at = ? WHERE id = ?")
            .bind(index)
            .bind(&now)
            .bind(id)
            .execute(pool)
            .await?;
    }
    if let Some(steps) = &body.steps {
        let steps_json = serde_json::to_string(steps)?;
        sqlx::query("UPDATE workflows SET steps = ?, updated_at = ? WHERE id = ?")
            .bind(steps_json)
            .bind(&now)
            .bind(id)
            .execute(pool)
            .await?;
    }

    get(pool, id).await
}

pub async fn delete(pool: &SqlitePool, id: &str) -> anyhow::Result<bool> {
    let result = sqlx::query("DELETE FROM workflows WHERE id = ?")
        .bind(id)
        .execute(pool)
        .await?;
    Ok(result.rows_affected() > 0)
}

pub async fn list_favorites(pool: &SqlitePool) -> anyhow::Result<Vec<String>> {
    let rows: Vec<(String,)> =
        sqlx::query_as("SELECT workflow_id FROM workflow_favorites ORDER BY workflow_id")
            .fetch_all(pool)
            .await?;
    Ok(rows.into_iter().map(|r| r.0).collect())
}

#[cfg(test)]
mod tests {
    use super::*;
    use sqlx::sqlite::{SqliteConnectOptions, SqlitePoolOptions};
    use std::str::FromStr;

    async fn test_pool() -> SqlitePool {
        let options = SqliteConnectOptions::from_str("sqlite::memory:")
            .unwrap()
            .foreign_keys(true);
        let pool = SqlitePoolOptions::new()
            .connect_with(options)
            .await
            .unwrap();
        let sql = include_str!("../../../../migrations/001_initial.sql");
        for statement in sql.split(';') {
            let s = statement.trim();
            if !s.is_empty() && !s.starts_with("--") {
                sqlx::query(s).execute(&pool).await.unwrap();
            }
        }
        pool
    }

    #[tokio::test]
    async fn seed_and_list_demo_workflow() {
        let pool = test_pool().await;
        ensure_seed(&pool).await.unwrap();
        let all = list_all(&pool).await.unwrap();
        assert!(all.iter().any(|w| w.id == "demo"));
    }
}

pub async fn toggle_favorite(pool: &SqlitePool, workflow_id: &str) -> anyhow::Result<bool> {
    let exists: Option<(i64,)> = sqlx::query_as(
        "SELECT 1 FROM workflow_favorites WHERE workflow_id = ?",
    )
    .bind(workflow_id)
    .fetch_optional(pool)
    .await?;

    if exists.is_some() {
        sqlx::query("DELETE FROM workflow_favorites WHERE workflow_id = ?")
            .bind(workflow_id)
            .execute(pool)
            .await?;
        Ok(false)
    } else {
        sqlx::query("INSERT INTO workflow_favorites (workflow_id) VALUES (?)")
            .bind(workflow_id)
            .execute(pool)
            .await?;
        Ok(true)
    }
}
