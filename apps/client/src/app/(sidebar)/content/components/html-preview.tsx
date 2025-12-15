import { useEffect, useRef } from "react";

export function HtmlPreview({ html }: { html: string }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const shadowRef = useRef<ShadowRoot | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;

    if (!shadowRef.current) {
      shadowRef.current = hostRef.current.attachShadow({ mode: "open" });
    }

    shadowRef.current.innerHTML = html;
  }, [html]);

  return <div ref={hostRef} />;
}
