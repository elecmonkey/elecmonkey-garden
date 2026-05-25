"use client";

import { useEffect, useRef, useState } from "react";
import MarkdownContent from "./MarkdownContent";

type DevLiveMarkdownContentProps = {
  slug: string;
  initialContent: string;
};

export default function DevLiveMarkdownContent({ slug, initialContent }: DevLiveMarkdownContentProps) {
  const [content, setContent] = useState(initialContent);
  const latestContentRef = useRef(initialContent);

  useEffect(() => {
    setContent(initialContent);
    latestContentRef.current = initialContent;
  }, [initialContent]);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    let disposed = false;
    let inflight = false;

    const syncLatest = async () => {
      if (inflight || disposed) {
        return;
      }

      inflight = true;
      try {
        const response = await fetch(`/api/dev/markdown/${encodeURIComponent(slug)}`, {
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { content?: string };
        if (typeof data.content !== "string") {
          return;
        }

        if (data.content !== latestContentRef.current) {
          latestContentRef.current = data.content;
          setContent(data.content);
        }
      } catch {
        // Ignore transient dev server errors in development.
      } finally {
        inflight = false;
      }
    };

    const stream = new EventSource(`/api/dev/markdown/stream/${encodeURIComponent(slug)}`);
    stream.addEventListener("markdown-update", () => {
      void syncLatest();
    });
    stream.onerror = () => {
      // Keep the connection managed by EventSource's internal reconnect logic.
    };

    return () => {
      disposed = true;
      stream.close();
    };
  }, [slug]);

  return <MarkdownContent content={content} />;
}