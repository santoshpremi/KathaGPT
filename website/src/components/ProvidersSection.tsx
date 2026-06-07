import { ProviderStrip } from "./ProviderStrip";

export function ProvidersSection() {
  return (
    <section id="providers" className="border-b border-stone-200 bg-white py-14 md:py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-label">Model providers</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-stone-900 md:text-3xl">
            Use the models you already pay for
          </h2>
          <p className="mt-3 text-base leading-relaxed text-stone-600">
            Switch between providers and models from one app. Your keys stay on
            your device — KathGPT never stores them in the cloud.
          </p>
        </div>

        <div className="mt-8">
          <ProviderStrip />
        </div>
      </div>
    </section>
  );
}
