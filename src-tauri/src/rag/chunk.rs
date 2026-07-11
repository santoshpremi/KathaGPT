/// Split document text into overlapping chunks for embedding (~500 tokens each).
pub const CHUNK_CHARS: usize = 2_000;
pub const CHUNK_OVERLAP: usize = 200;

pub fn chunk_text(text: &str) -> Vec<String> {
    let trimmed = text.trim();
    if trimmed.is_empty() {
        return vec![];
    }
    if trimmed.chars().count() <= CHUNK_CHARS {
        return vec![trimmed.to_string()];
    }

    let paragraphs: Vec<&str> = trimmed
        .split("\n\n")
        .map(str::trim)
        .filter(|p| !p.is_empty())
        .collect();

    let mut raw_chunks: Vec<String> = Vec::new();
    let mut current = String::new();

    for paragraph in paragraphs {
        let candidate = if current.is_empty() {
            paragraph.to_string()
        } else {
            format!("{current}\n\n{paragraph}")
        };

        if candidate.chars().count() <= CHUNK_CHARS {
            current = candidate;
        } else {
            if !current.is_empty() {
                raw_chunks.push(current.clone());
            }
            if paragraph.chars().count() <= CHUNK_CHARS {
                current = paragraph.to_string();
            } else {
                for part in split_hard(paragraph, CHUNK_CHARS) {
                    raw_chunks.push(part);
                }
                current.clear();
            }
        }
    }

    if !current.is_empty() {
        raw_chunks.push(current);
    }

    apply_overlap(&raw_chunks)
}

fn split_hard(text: &str, max_len: usize) -> Vec<String> {
    let chars: Vec<char> = text.chars().collect();
    let mut parts = Vec::new();
    let mut start = 0;
    while start < chars.len() {
        let end = (start + max_len).min(chars.len());
        parts.push(chars[start..end].iter().collect());
        start = end;
    }
    parts
}

fn apply_overlap(chunks: &[String]) -> Vec<String> {
    if chunks.len() <= 1 {
        return chunks.to_vec();
    }

    let mut out = Vec::with_capacity(chunks.len());
    for (i, chunk) in chunks.iter().enumerate() {
        if i == 0 {
            out.push(chunk.clone());
            continue;
        }
        let prev = &chunks[i - 1];
        let overlap: String = prev.chars().rev().take(CHUNK_OVERLAP).collect::<String>().chars().rev().collect();
        if overlap.is_empty() {
            out.push(chunk.clone());
        } else {
            out.push(format!("{overlap}\n\n{chunk}"));
        }
    }
    out
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn empty_text_returns_no_chunks() {
        assert!(chunk_text("").is_empty());
    }

    #[test]
    fn short_text_is_single_chunk() {
        assert_eq!(chunk_text("Hello world").len(), 1);
    }

    #[test]
    fn long_text_splits_into_multiple_chunks() {
        let text = "word ".repeat(800);
        let chunks = chunk_text(&text);
        assert!(chunks.len() > 1);
        for chunk in &chunks {
            assert!(chunk.chars().count() <= CHUNK_CHARS + CHUNK_OVERLAP + 50);
        }
    }
}
