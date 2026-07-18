import { useCallback, useEffect, useRef, useState } from "react";
import { AppWindow } from "./AppWindow";
import {
  PRODUCT_FEATURES,
  type FeatureId,
  type ProductFeature,
} from "../lib/features";

const SLIDE_COUNT = PRODUCT_FEATURES.length;
const SCROLL_VH_PER_SLIDE = 130;
/** Stay on the current slide until this far through its scroll segment. */
const SEGMENT_HOLD_RATIO = 0.78;
const SECTION_INTRO_HOLD = 0.1;

function progressToSlideIndex(progress: number): number {
  if (progress < SECTION_INTRO_HOLD) return 0;

  const segment = 1 / SLIDE_COUNT;
  const adjusted =
    (progress - SECTION_INTRO_HOLD) / Math.max(1 - SECTION_INTRO_HOLD, 0.001);
  let index = Math.floor(adjusted / segment);
  const intoSegment = (adjusted % segment) / segment;

  if (intoSegment < SEGMENT_HOLD_RATIO && index > 0) {
    index -= 1;
  }

  return Math.min(SLIDE_COUNT - 1, Math.max(0, index));
}

function slideIndexToProgress(index: number): number {
  if (index <= 0) return 0;

  const segment = 1 / SLIDE_COUNT;
  const adjusted = index * segment + segment * (SEGMENT_HOLD_RATIO + 0.05);
  return (
    SECTION_INTRO_HOLD + adjusted * Math.max(1 - SECTION_INTRO_HOLD, 0.001)
  );
}

const TAB_ICONS: Record<
  FeatureId,
  (props: { className?: string }) => JSX.Element
> = {
  chat: ChatIcon,
  image: ImageIcon,
  research: ResearchIcon,
  translation: TranslateIcon,
  meeting: MeetingIcon,
};

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

export function ProductShowcase() {
  const sectionRef = useRef<HTMLElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [activeIndex, setActiveIndex] = useState(0);

  const scrollToIndex = useCallback(
    (index: number) => {
      if (prefersReducedMotion) {
        setActiveIndex(index);
        return;
      }

      const section = sectionRef.current;
      if (!section) return;

      const maxScroll = section.offsetHeight - window.innerHeight;
      if (maxScroll <= 0) {
        setActiveIndex(index);
        return;
      }

      const target =
        section.offsetTop + maxScroll * slideIndexToProgress(index);

      window.scrollTo({ top: target, behavior: "smooth" });
    },
    [prefersReducedMotion],
  );

  useEffect(() => {
    const section = sectionRef.current;
    if (!section || prefersReducedMotion) return;

    const onScroll = () => {
      const rect = section.getBoundingClientRect();
      const maxScroll = section.offsetHeight - window.innerHeight;
      if (maxScroll <= 0) return;

      // Keep the first slide until the section is fully pinned in view.
      if (rect.top > 0) {
        setActiveIndex(0);
        return;
      }

      const progress = Math.min(1, Math.max(0, -rect.top / maxScroll));
      setActiveIndex(progressToSlideIndex(progress));
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [prefersReducedMotion]);

  return (
    <section
      id="product"
      ref={sectionRef}
      className="relative border-b border-stone-900/40 bg-black/30 backdrop-blur-[2px]"
      style={{
        height: prefersReducedMotion
          ? undefined
          : `${SLIDE_COUNT * SCROLL_VH_PER_SLIDE}vh`,
      }}
    >
      <div
        className={
          prefersReducedMotion
            ? "py-24 md:py-32"
            : "sticky top-16 flex h-[calc(100vh-4rem)] flex-col overflow-hidden py-6 md:top-20 md:py-8"
        }
      >
        <div className="mx-auto flex h-full w-full max-w-6xl flex-col px-6">
          <div className="mx-auto max-w-3xl shrink-0 text-center">
            <p className="section-label">Product</p>
            <h2 className="section-title mt-3 md:text-5xl">
              One app. Five powerful tools.
            </h2>
          </div>

          <div className="relative mt-6 min-h-0 flex-1 overflow-hidden md:mt-8">
            <div
              className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {PRODUCT_FEATURES.map((feature, index) => (
                <div
                  key={feature.id}
                  className="w-full shrink-0 px-0"
                  aria-hidden={index !== activeIndex}
                >
                  <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start lg:gap-12">
                    <AppWindow
                      image={feature.image}
                      alt={`KathaGPT ${feature.label} screenshot`}
                      className="shadow-product"
                      priority={index === 0}
                    />
                    <FeaturePanel feature={feature} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 shrink-0 pt-6 md:pt-8">
            {!prefersReducedMotion && (
              <p className="mb-4 text-center text-xs text-stone-500">
                Scroll to explore each tool
              </p>
            )}

            <nav
              className="mx-auto flex w-full max-w-5xl flex-nowrap items-center justify-start gap-1 overflow-x-auto rounded-full border border-stone-900/80 bg-black/40 p-1 backdrop-blur-sm sm:justify-center [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Product features"
            >
              {PRODUCT_FEATURES.map((item, index) => {
                const Icon = TAB_ICONS[item.id];
                const isActive = index === activeIndex;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToIndex(index)}
                    className={`inline-flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3 py-2 text-xs font-medium transition sm:gap-2 sm:px-4 sm:py-2.5 sm:text-sm ${
                      isActive
                        ? "bg-stone-100 text-black shadow-soft"
                        : "text-stone-400 hover:text-white"
                    }`}
                    aria-pressed={isActive}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturePanel({ feature }: { feature: ProductFeature }) {
  return (
    <div className="mt-10 lg:mt-0">
      <div className="surface-card p-6 lg:sticky lg:top-28">
        <p className="section-label">{feature.label}</p>
        <h3 className="mt-2 text-xl font-semibold text-white">
          {feature.title}
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-stone-400">
          {feature.description}
        </p>
        <ul className="mt-5 space-y-3">
          {feature.bullets.map((bullet) => (
            <li key={bullet} className="flex gap-3 text-sm text-stone-300">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-stone-600" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function ChatIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
      />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z"
      />
    </svg>
  );
}

function ResearchIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
      />
    </svg>
  );
}

function TranslateIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802"
      />
    </svg>
  );
}

function MeetingIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={1.5}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.065 6.065 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
      />
    </svg>
  );
}
