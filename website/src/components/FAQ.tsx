const faqs = [
  {
    q: "Is KathGPT really free?",
    a: "Yes. KathGPT Local Edition is open source (MIT). You only pay for the LLM API usage through your chosen provider (e.g. OpenRouter, OpenAI).",
  },
  {
    q: "Where is my data stored?",
    a: "Everything stays on your computer in a SQLite database inside your OS app-data folder — for example ~/Library/Application Support/KathGPT/ on macOS.",
  },
  {
    q: "Do I need an internet connection?",
    a: "You need internet to call LLM APIs when chatting. The app itself works offline for browsing history, settings, and workflows.",
  },
  {
    q: "Which AI models are supported?",
    a: "Any model available through your configured providers — typically GPT, Claude, Gemini, and more via OpenRouter, plus direct OpenAI, Anthropic, Google, and Perplexity keys.",
  },
  {
    q: "How is this different from ChatGPT?",
    a: "KathGPT runs as a native desktop app with local storage. There are no accounts, no subscription to us, and no cloud copy of your conversations.",
  },
];

export function FAQ() {
  return (
    <section id="faq" className="border-t border-white/5 py-24">
      <div className="mx-auto max-w-3xl px-6">
        <h2 className="text-center text-3xl font-bold tracking-tight text-white md:text-4xl">
          Frequently asked questions
        </h2>

        <dl className="mt-12 space-y-4">
          {faqs.map((item) => (
            <div
              key={item.q}
              className="rounded-xl border border-white/5 bg-slate-900/30 px-6 py-5"
            >
              <dt className="font-semibold text-white">{item.q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-slate-400">
                {item.a}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
