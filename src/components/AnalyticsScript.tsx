"use client";

import { useEffect } from "react";

const PROD_HOSTNAMES = new Set(["www.elecmonkey.com", "elecmonkey.com"]);

export default function AnalyticsScript() {
  useEffect(() => {
    if (!PROD_HOSTNAMES.has(window.location.hostname)) {
      return;
    }

    const script = document.createElement("script");
    script.src = "https://lh.elecmonkey.com/script.js";
    script.defer = true;
    script.dataset.websiteId = "703c2fe3-1b54-4a32-8503-37976cbed672";
    document.head.appendChild(script);

    return () => {
      script.remove();
    };
  }, []);

  return null;
}