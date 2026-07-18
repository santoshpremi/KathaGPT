import { useEffect, useState } from "react";
import {
  getPageBackground,
  type PageBackgroundId,
} from "../lib/site";

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

export function PageBackground({ id }: { id: PageBackgroundId }) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const background = getPageBackground(id);

  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {prefersReducedMotion ? (
        <img
          src={background.poster}
          alt=""
          className="h-full w-full scale-105 object-cover object-center"
        />
      ) : (
        <video
          key={background.id}
          className="h-full w-full scale-105 object-cover object-center"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          poster={background.poster}
        >
          <source src={background.video} type="video/mp4" />
        </video>
      )}
      <div className="absolute inset-0 bg-black/35" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-black/70" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_20%,rgba(0,0,0,0.45)_100%)]" />
    </div>
  );
}
