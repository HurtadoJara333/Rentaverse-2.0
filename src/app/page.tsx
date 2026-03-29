// src/app/page.tsx
"use client";
import { useEffect } from "react";
import { useShowroomStore } from "@/stores/showroomStore";
import LandingPage from "@/components/landing/LandingPage";
import ShowroomPage from "@/components/showroom/ShowroomPage";

export default function Home() {
  const view = useShowroomStore((s) => s.view);

  // Manage body overflow per view:
  // - showroom: hidden (canvas is fixed, no page scroll needed)
  // - landing:  auto (page needs to scroll)
  useEffect(() => {
    document.body.style.overflow = view === "showroom" ? "hidden" : "";
    document.documentElement.style.overflow = view === "showroom" ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [view]);

  return view === "landing" ? <LandingPage /> : <ShowroomPage />;
}
