# KathaGPT Local Edition

[English](README.md) | [Español](README.es.md) | **日本語**

**高速でプライバシーを守るAIチャットを、あなたのマシンで — Rust製。** ローカルAIモデルをAPIキー不要で実行、またはクラウドプロバイダー用に自分のキーを設定できます。すべての会話はあなたのデバイス内に留まります。

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

## ローカルLLMの完全サポート — APIキー不要

> **Add Local Model** をクリック → 検索 → **Download** → チャット開始。ターミナルもOllamaも外部インストールも不要です。

KathaGPTは内蔵の**llama.cppエンジン**を使い、AIモデルをあなたのマシン上で完全にローカル実行します。実行用バイナリ（約15MB）と`.gguf`モデルファイルはオンデマンドで取得されるため、インストーラー自体はコンパクトなままです。

### 仕組み

```text
Open KathaGPT
  → Click "Add Local Model" in the user menu
  → Browse or search 18 curated models (Llama, Mistral, Gemma, Phi, Qwen, DeepSeek…)
  → Click Download on e.g. "Llama 3.2 3B"
  → Progress bar: downloads llama-server runtime + .gguf from HuggingFace
  → Model appears in the chat picker
  → Chat offline, forever — no API key needed
```

### 利用可能なモデル（厳選18モデル、最大16GB RAM）

| RAM | Models |
|-----|--------|
| **2–4 GB** | Llama 3.2 1B · Gemma 2 2B · Llama 3.2 3B · Phi-3 Mini 3.8B · Qwen 3 4B |
| **8 GB** | Mistral 7B v0.3 · Llama 3.1 8B · Qwen 2.5 7B · Qwen 3 8B · DeepSeek R1 7B · Gemma 2 9B |
| **12 GB** | Gemma 3 12B · Mistral Nemo 12B · Phi-4 14B · Qwen 2.5 14B · Qwen 3 14B · DeepSeek R1 14B |
| **16 GB** | Mistral Small 22B · Qwen 2.5 32B |

すべてのモデルはQ4_K_M量子化済みの`.gguf`ファイルで、[bartowski](https://huggingface.co/bartowski)およびHuggingFace上の公式リポジトリから取得しています。GPUアクセラレーションは自動で有効になります — **Apple SiliconではMetal**、NVIDIAではCUDA、それ以外の環境ではCPUにフォールバックします。

---

## Rustによる高速化

KathaGPTのバックエンドは**100% Rust**で構築されており、旧Node.jsサーバーは廃止されました。単一のネイティブコアがすべてを処理します。

| メリット | 仕組み |
|---------|-----|
| **低オーバーヘッド** | AxumのAPIがTauriプロセスに組み込まれており、Nodeランタイムも Electronの Chromiumバンドルも不要 |
| **高速ストリーミング** | SSEトークンストリームをRust（`reqwest` + Tokio）で処理し、レイテンシを最小化 |
| **効率的なストレージ** | `sqlx`経由のSQLiteで、チャット履歴・ワークフロー・設定を即座にディスクへ保存 |
| **メモリ安全性** | Rustはコンパイル時にデータ競合やuse-after-freeを検出 |
| **軽量インストーラー** | TauriはOSのWebViewを利用するため、Electronよりインストーラーが小さくRAM消費も少ない |
| **ループバック限定API** | サーバーは`127.0.0.1:17890`でリッスンし、LANには公開されない |

```
┌──────────────────────────────────────────────────┐
│  KathaGPT.app / .exe / .AppImage                  │
│  ┌────────────────────────────────────────────┐   │
│  │  Tauri (Rust)                              │   │
│  │  • Native window + system tray             │   │
│  │  • Axum API · SQLite · LLM routing         │   │
│  │  • llama-server sidecar (local models)     │   │
│  │  • WebView → React UI (dist/)              │   │
│  └────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
       │ Local inference (127.0.0.1:11435)
       ▼
  llama-server (llama.cpp) — Metal / CUDA / CPU

       │ HTTPS (only when you use a cloud model)
       ▼
  OpenRouter / OpenAI / Anthropic / Gemini / Perplexity
```

---

## KathaGPTを選ぶ理由

- **真にローカル** — Llama、Mistral、Phi-4、Qwen、DeepSeekなどをAPIキーなしで実行できます。
- **BYOKクラウド対応** — OpenRouter、OpenAI、Anthropic、Gemini、Perplexityにも接続可能です。
- **キーの保護** — APIキーはローカルに保存され、UI上ではマスク表示されます。詳細は[SECURITY.md](SECURITY.md)をご覧ください。
- **ネイティブデスクトップ** — ワンクリックで`.dmg` / `.msi` / `.AppImage`をインストール。Electronのオーバーヘッドはありません。
- **オープンソース** — MITライセンス。自由に閲覧・フォーク・セルフホストできます。

### 主な機能

| カテゴリ | 機能 |
|------|----------|
| **ローカルLLM** | ワンクリックで使える18モデル、Metal/CUDAによるGPUアクセラレーション、llama.cppサイドカー、リアルタイムのダウンロード進捗表示 |
| **チャット** | ストリーミング応答、マルチモデルピッカー、アーティファクト、下書きチャット |
| **ツール** | リサーチアシスタント（Sonar + 引用）、画像生成、翻訳、議事録作成 |
| **生産性向上** | ワークフロー、プロンプトライブラリ、JSONエクスポート/インポート |

---

## クイックスタート

### 前提条件

| ツール | バージョン |
|------|---------|
| [Node.js](https://nodejs.org/) | ≥ 20.12（`.nvmrc`参照） |
| [pnpm](https://pnpm.io/) | 9+ |
| [Rust](https://rustup.rs/) | stable（APIおよびデスクトップビルド用） |

デスクトップビルドを行う場合は、お使いのOS向けに[Tauriの前提条件](https://v2.tauri.app/start/prerequisites/)をインストールしてください。

### 1. インストールと実行

```bash
git clone https://github.com/santoshpremi/KathaGPT.git
cd KathaGPT
pnpm install
./start-dev.sh          # or: pnpm dev
```

**http://localhost:5173** を開いてください。Rust製APIは**http://127.0.0.1:17890**で稼働し、`/api/local`としてプロキシされます。

### 2. APIキーの追加（任意）

サンプルの環境変数ファイルをコピーし、少なくとも1つのプロバイダーキーを追加してください。

```bash
cp .env.example .env
```

またはアプリ内から追加することもできます：**Settings → API Keys**。クラウドモデルへの対応が最も広いため、OpenRouterの利用を推奨します。

> **ローカルモデルにはキーは不要です。** **Add Local Model**をクリックしてダウンロードするだけです。

### 3. デスクトップアプリ

```bash
pnpm tauri:dev          # dev with native window
pnpm tauri:build        # production installer (.dmg / .msi / .AppImage)
```

**macOSへのインストール（未署名ビルド）：** [ウェブサイト](https://santoshpremi.github.io/KathaGPT/)からダウンロードするか、ローカルでビルドしてください。macOSで「開発元を検証できません」と表示される場合、ブラウザによって隔離フラグが付与されたためです — Apple公証（年間$99の Developer ID）を行っていない場合、これは想定内の動作です。

1. **ターミナル（推奨）：** `.dmg`を`~/Downloads`にダウンロードした後、[ダウンロードページ](https://santoshpremi.github.io/KathaGPT/#download)にあるワンライナーを実行するか、以下を実行してください。
   ```bash
   ./scripts/install-macos.sh
   ```
2. **すでにApplicationsフォルダにある場合：** `xattr -cr /Applications/KathaGPT.app && open -a KathaGPT`
3. **手動の場合：** **KathaGPT.app**を右クリック → **開く** → もう一度**開く**。

CIから公証済みビルドを配布するには、GitHubシークレットを追加してください：`APPLE_CERTIFICATE`、`APPLE_CERTIFICATE_PASSWORD`、`APPLE_SIGNING_IDENTITY`、`APPLE_ID`、`APPLE_PASSWORD`、`APPLE_TEAM_ID`。

---

## コントリビュート

Issueやプルリクエストを歓迎します。着手する前に[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md)と[SECURITY.md](SECURITY.md)をご確認ください。


## ライセンス

MIT — 詳細は[LICENSE](LICENSE)をご覧ください。
