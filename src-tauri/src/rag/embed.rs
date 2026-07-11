/// Local embedding via feature hashing (384-dim). No external model download required.
/// Swap for fastembed / sqlite-vec vec0 when upgrading embedding quality.
pub const EMBED_DIM: usize = 384;

pub fn embed_text(text: &str) -> Vec<f32> {
    let mut vec = vec![0f32; EMBED_DIM];
    let normalized = text.to_lowercase();

    for token in tokenize(&normalized) {
        add_ngram(&mut vec, &token, 1.0);
    }

    for window in normalized.as_bytes().windows(3) {
        if let Ok(s) = std::str::from_utf8(window) {
            add_ngram(&mut vec, s, 0.3);
        }
    }

    normalize_l2(&mut vec);
    vec
}

pub fn cosine_similarity(a: &[f32], b: &[f32]) -> f32 {
    if a.len() != b.len() || a.is_empty() {
        return 0.0;
    }
    let mut dot = 0f32;
    let mut na = 0f32;
    let mut nb = 0f32;
    for (x, y) in a.iter().zip(b.iter()) {
        dot += x * y;
        na += x * x;
        nb += y * y;
    }
    if na == 0.0 || nb == 0.0 {
        0.0
    } else {
        dot / (na.sqrt() * nb.sqrt())
    }
}

pub fn embedding_to_bytes(vec: &[f32]) -> Vec<u8> {
    vec.iter().flat_map(|f| f.to_le_bytes()).collect()
}

pub fn embedding_from_bytes(bytes: &[u8]) -> Vec<f32> {
    bytes
        .chunks_exact(4)
        .map(|c| f32::from_le_bytes([c[0], c[1], c[2], c[3]]))
        .collect()
}

fn tokenize(text: &str) -> Vec<String> {
    text.split(|c: char| !c.is_alphanumeric())
        .filter(|t| t.len() >= 2)
        .map(str::to_string)
        .collect()
}

fn add_ngram(vec: &mut [f32], token: &str, weight: f32) {
    let h1 = fnv_hash(token, 0) as usize % vec.len();
    let h2 = fnv_hash(token, 1) as usize % vec.len();
    vec[h1] += weight;
    vec[h2] -= weight * 0.5;
}

fn fnv_hash(s: &str, seed: u64) -> u64 {
    let mut hash = 0xcbf29ce484222325u64 ^ seed;
    for b in s.bytes() {
        hash ^= b as u64;
        hash = hash.wrapping_mul(0x100000001b3);
    }
    hash
}

fn normalize_l2(vec: &mut [f32]) {
    let norm: f32 = vec.iter().map(|x| x * x).sum::<f32>().sqrt();
    if norm > 0.0 {
        for x in vec.iter_mut() {
            *x /= norm;
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn embedding_has_correct_dimension() {
        let e = embed_text("revenue growth Q3 2025");
        assert_eq!(e.len(), EMBED_DIM);
    }

    #[test]
    fn similar_text_has_higher_cosine() {
        let a = embed_text("Q3 revenue increased by 15 percent");
        let b = embed_text("revenue growth in the third quarter");
        let c = embed_text("completely unrelated weather forecast");
        assert!(cosine_similarity(&a, &b) > cosine_similarity(&a, &c));
    }

    #[test]
    fn bytes_roundtrip() {
        let e = embed_text("test document chunk");
        let bytes = embedding_to_bytes(&e);
        let back = embedding_from_bytes(&bytes);
        assert_eq!(e.len(), back.len());
        assert!((cosine_similarity(&e, &back) - 1.0).abs() < 0.001);
    }
}
