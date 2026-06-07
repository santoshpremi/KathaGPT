const steps = [
  {
    number: "01",
    title: "Download KathGPT",
    description:
      "Install the native desktop app for macOS, Windows, or Linux. No account required.",
  },
  {
    number: "02",
    title: "Add your API keys",
    description:
      "Connect OpenRouter, Perplexity, OpenAI, Anthropic, Google, or any supported provider.",
  },
  {
    number: "03",
    title: "Work locally",
    description:
      "Chat, research, generate images, and translate files — conversations stay in SQLite on your machine.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-b border-stone-200 bg-stone-50 py-20 md:py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-label">How it works</p>
          <h2 className="section-title mt-3">Up and running in minutes</h2>
        </div>

        <ol className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.number} className="surface-card relative p-6 md:p-7">
              <span className="text-xs font-medium tracking-[0.2em] text-stone-400">
                {step.number}
              </span>
              <h3 className="mt-3 text-lg font-semibold text-stone-900">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
