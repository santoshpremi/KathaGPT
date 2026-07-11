/// Fallback embedding when fastembed model is unavailable (offline / first-run failure).
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
    fn hash_embedding_dimension() {
        assert_eq!(embed_text("hello").len(), EMBED_DIM);
    }
}
