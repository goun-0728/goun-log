"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

export default function VisitTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const path = `${window.location.pathname}${window.location.search}`;

    void fetch("/api/track-visit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ path }),
    }).catch(() => {
      // Analytics must never block the public site.
    });
  }, [pathname]);

  return null;
}
