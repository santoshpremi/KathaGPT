import { SITE } from "../lib/site";
import { MemeCard } from "./memes/MemeCard";
import { MEMES } from "./memes/memes";

export function Memes() {
  return (
    <section id="memes" className="border-t border-stone-200 bg-stone-100/80 py-24">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="section-label">Internet-approved</p>
          <h2 className="section-title mt-3">The memes write themselves</h2>
          <p className="section-body mt-4">
            Paid API vs local LLM vs KathaGPT — the Olympic shooter format, but for AI.
            Share these if you also believe one Rust binary beats a Kubernetes cluster.
          </p>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-2">
          {MEMES.map((meme) => (
            <MemeCard key={meme.id} meme={meme} />
          ))}
        </div>

        <p className="mt-10 text-center text-sm text-stone-500">
          Download the app that dual-wields local + cloud at{" "}
          <a href="#download" className="font-medium text-stone-800 underline-offset-2 hover:underline">
            {SITE.name}
          </a>
          {" · "}
          <a
            href={`https://github.com/${SITE.githubRepo}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-stone-800 underline-offset-2 hover:underline"
          >
            Star on GitHub
          </a>
        </p>
      </div>
    </section>
  );
}
