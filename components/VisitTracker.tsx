"use client";

import { useEffect } from "react";

export default function VisitTracker() {
  useEffect(() => {
    const path = `${window.location.pathname}${window.location.search}`;

    fetch("/api/track-visit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path }),
      keepalive: true,
    }).catch(() => {
      // Analytics must never block the public site.
    });
  }, []);

  return null;
}
