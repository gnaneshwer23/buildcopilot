"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { LandingPage } from "@/components/LandingPage";
import { Onboarding } from "@/components/Onboarding";
import { WorkspaceClient } from "@/components/WorkspaceClient";

const PROFILE_KEY = "fp_profile";

type UserProfile = { name: string; role: string; project: string };
type AppState = "loading" | "landing" | "onboarding" | "workspace";

export default function Home() {
  const { data: session, status } = useSession();
  const [appState, setAppState] = useState<AppState>("loading");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      setAppState("landing");
      return;
    }

    const saved = localStorage.getItem(PROFILE_KEY);
    if (saved) {
      try {
        setUserProfile(JSON.parse(saved));
        setAppState("workspace");
        return;
      } catch {
        localStorage.removeItem(PROFILE_KEY);
      }
    }

    setAppState("onboarding");
  }, [session, status]);

  function handleOnboardingComplete(profile: UserProfile) {
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
    setUserProfile(profile);
    setAppState("workspace");
  }

  if (appState === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-5 h-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  if (appState === "landing") {
    return <LandingPage onGetStarted={() => setAppState("onboarding")} />;
  }

  if (appState === "onboarding") {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  const name = userProfile?.name ?? session?.user?.name ?? "User";
  const role = userProfile?.role ?? "Product Manager";
  const project = userProfile?.project ?? "Untitled";

  return <WorkspaceClient userProfile={{ name, role, project }} />;
}
