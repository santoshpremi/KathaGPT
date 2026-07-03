# KathaGPT Local Edition

[English](README.md) | **Español** | [🇯🇵 日本語](README.ja.md)

**Chat de IA rápido y privado en tu propio equipo, impulsado por Rust.** Ejecuta modelos locales sin claves de API, o conecta tus propias claves para proveedores en la nube. Todas las conversaciones permanecen en tu dispositivo.

![KathaGPT demo](docs/demo.gif)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![GitHub](https://img.shields.io/github/stars/santoshpremi/KathaGPT?style=social)](https://github.com/santoshpremi/KathaGPT)

| | |
|---|---|
| **Version** | 0.1.0 |
| **Stack** | React · **Rust (Axum)** · Tauri v2 · SQLite · llama.cpp |
| **Platforms** | macOS · Windows · Linux |
| **Repo** | [github.com/santoshpremi/KathaGPT](https://github.com/santoshpremi/KathaGPT) |
| **Website** | [santoshpremi.github.io/KathaGPT](https://santoshpremi.github.io/KathaGPT/) |

---

## Soporte completo para LLM locales, sin clave de API

> Haz clic en **Add Local Model** -> busca -> **Download** -> chatea. Sin terminal, sin Ollama y sin instalaciones externas.

KathaGPT descarga y ejecuta modelos de IA completamente en tu equipo mediante un motor **llama.cpp** integrado. El binario de ejecución (~15 MB) y los archivos de modelo `.gguf` se descargan bajo demanda, por lo que el instalador se mantiene compacto.

### Cómo funciona

```text
Open KathaGPT
  → Click "Add Local Model" in the user menu
  → Browse or search 18 curated models (Llama, Mistral, Gemma, Phi, Qwen, DeepSeek…)
  → Click Download on e.g. "Llama 3.2 3B"
  → Progress bar: downloads llama-server runtime + .gguf from HuggingFace
  → Model appears in the chat picker
  → Chat offline, forever — no API key needed
```

### Modelos disponibles (18 modelos seleccionados, hasta 16 GB de RAM)

| RAM | Models |
|-----|--------|
| **2-4 GB** | Llama 3.2 1B · Gemma 2 2B · Llama 3.2 3B · Phi-3 Mini 3.8B · Qwen 3 4B |
| **8 GB** | Mistral 7B v0.3 · Llama 3.1 8B · Qwen 2.5 7B · Qwen 3 8B · DeepSeek R1 7B · Gemma 2 9B |
| **12 GB** | Gemma 3 12B · Mistral Nemo 12B · Phi-4 14B · Qwen 2.5 14B · Qwen 3 14B · DeepSeek R1 14B |
| **16 GB** | Mistral Small 22B · Qwen 2.5 32B |

Todos los modelos son archivos `.gguf` cuantizados en Q4_K_M, obtenidos de [bartowski](https://huggingface.co/bartowski) y de repositorios oficiales en HuggingFace. La aceleración por GPU es automática: **Metal en Apple Silicon**, CUDA en NVIDIA y CPU como alternativa en cualquier equipo.

---

## Impulsado por Rust

El backend de KathaGPT es **100% Rust**. El servidor antiguo en Node.js ya no existe. Un único núcleo nativo se encarga de todo:

| Beneficio | Cómo |
|---------|-----|
| **Baja sobrecarga** | API Axum integrada en el proceso de Tauri: sin runtime de Node ni paquete Chromium de Electron |
| **Streaming rápido** | Flujos SSE de tokens procesados en Rust (`reqwest` + Tokio) con latencia mínima |
| **Almacenamiento eficiente** | SQLite mediante `sqlx`: historial de chat, workflows y ajustes en disco |
| **Seguridad de memoria** | Rust detecta carreras de datos y use-after-free en tiempo de compilación |
| **Instalador pequeño** | Tauri usa el WebView del sistema operativo, con menos tamaño y menos RAM que Electron |
| **API solo en loopback** | El servidor escucha en `127.0.0.1:17890`, no queda expuesto a tu red local |

---

## Por qué KathaGPT

- **Realmente local**: ejecuta Llama, Mistral, Phi-4, Qwen, DeepSeek y más sin claves de API.
- **BYOK para la nube**: también se conecta a OpenRouter, OpenAI, Anthropic, Gemini y Perplexity.
- **Claves protegidas**: las claves de API se guardan localmente y aparecen enmascaradas en la interfaz. Consulta [SECURITY.md](SECURITY.md).
- **Aplicación de escritorio nativa**: instaladores `.dmg`, `.msi` y `.AppImage`; sin la sobrecarga de Electron.
- **Código abierto**: licencia MIT; puedes inspeccionarlo, crear un fork y alojarlo por tu cuenta.

### Qué incluye

| Área | Funciones |
|------|----------|
| **LLM local** | 18 modelos con un clic, aceleración GPU Metal/CUDA, sidecar llama.cpp y progreso de descarga en tiempo real |
| **Chat** | Respuestas en streaming, selector multimodelo, artifacts y borradores de chat |
| **Herramientas** | Asistente de investigación (Sonar + citas), generador de imágenes, traductor y notas de reunión |
| **Productividad** | Workflows, biblioteca de prompts y exportación/importación JSON |

---

## Inicio rápido

### Requisitos previos

| Herramienta | Versión |
|------|---------|
| [Node.js](https://nodejs.org/) | >= 20.12 (ver `.nvmrc`) |
| [pnpm](https://pnpm.io/) | 9+ |
| [Rust](https://rustup.rs/) | stable (para API y builds de escritorio) |

Para builds de escritorio, instala los [requisitos de Tauri](https://v2.tauri.app/start/prerequisites/) de tu sistema operativo.

### 1. Instalar y ejecutar

```bash
git clone https://github.com/santoshpremi/KathaGPT.git
cd KathaGPT
pnpm install
./start-dev.sh          # or: pnpm dev
```

Abre **http://localhost:5173**. La API en Rust se ejecuta en **http://127.0.0.1:17890** y se expone al frontend mediante el proxy `/api/local`.

### 2. Añadir una clave de API (opcional)

Copia el archivo de entorno de ejemplo y añade al menos una clave de proveedor:

```bash
cp .env.example .env
```

También puedes añadir claves desde la aplicación: **Settings -> API Keys**. OpenRouter es la opción recomendada para acceder a la selección más amplia de modelos en la nube.

> **No necesitas clave para los modelos locales.** Solo haz clic en **Add Local Model** y descarga uno.

### 3. Aplicación de escritorio

```bash
pnpm tauri:dev          # dev with native window
pnpm tauri:build        # production installer (.dmg / .msi / .AppImage)
```

---

## Contribuir

Las issues y pull requests son bienvenidas. Antes de empezar, revisa [CONTRIBUTING.md](CONTRIBUTING.md), [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) y [SECURITY.md](SECURITY.md).

Para contribuir de forma rápida:

1. Crea un fork del repositorio y una rama desde `main`.
2. Mantén los cambios pequeños y enfocados.
3. Ejecuta las comprobaciones relevantes antes de abrir la PR:

   ```bash
   pnpm test:e2e
   cd src-tauri
   cargo test
   ```

4. Abre una pull request contra `main` y explica qué cambiaste y por qué.

Las tareas etiquetadas como [`good first issue`](https://github.com/santoshpremi/KathaGPT/issues?q=is%3Aopen+label%3A%22good+first+issue%22) están pensadas para nuevos colaboradores.

## Licencia

MIT. Consulta [LICENSE](LICENSE).
