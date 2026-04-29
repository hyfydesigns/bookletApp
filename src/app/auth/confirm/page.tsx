"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { syncUser } from "@/actions/users";
import { Loader2 } from "lucide-react";
import type { EmailOtpType } from "@supabase/supabase-js";

export default function AuthConfirmPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let settled = false;

    async function redirect() {
      if (settled) return;
      settled = true;
      await syncUser();
      router.replace("/dashboard");
    }

    // onAuthStateChange fires when the client detects hash-based tokens
    // (implicit flow: #access_token=xxx) — must be set up before handleAuth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session && !settled) {
          await redirect();
        }
      }
    );

    async function handleAuth() {
      // 1. Already have a session (e.g. user is already signed in)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await redirect();
        return;
      }

      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash;

      // 2. PKCE code (?code=xxx) — works when Supabase uses PKCE flow
      const code = params.get("code");
      if (code) {
        const { error: exchErr } = await supabase.auth.exchangeCodeForSession(code);
        if (!exchErr) return; // onAuthStateChange will fire and call redirect()
      }

      // 3. token_hash + type (?token_hash=xxx&type=invite)
      const token_hash = params.get("token_hash");
      const type = params.get("type");
      if (token_hash && type) {
        const { error: otpErr } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as EmailOtpType,
        });
        if (!otpErr) return; // onAuthStateChange will fire and call redirect()
      }

      // 4. Hash-based tokens — onAuthStateChange above handles this automatically.
      //    Give it 4s to fire before showing an error.
      if (hash.includes("access_token")) return;

      // Nothing worked — show error with debug info so we can diagnose
      const info = [
        `search: ${window.location.search || "(empty)"}`,
        `hash: ${hash ? hash.substring(0, 60) + "…" : "(empty)"}`,
        code ? `code: present` : null,
        token_hash ? `token_hash: present` : null,
      ]
        .filter(Boolean)
        .join(" | ");

      setDebugInfo(info);
      setError(
        "This link is invalid or has expired. Please ask your admin to send a new invitation."
      );
    }

    handleAuth();

    // Fallback: if onAuthStateChange never fires (hash tokens), show error after 5s
    const timeout = setTimeout(() => {
      if (!settled) {
        setError(
          "This link is invalid or has expired. Please ask your admin to send a new invitation."
        );
      }
    }, 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3 max-w-sm px-4">
          <p className="font-semibold text-destructive">Link expired</p>
          <p className="text-sm text-muted-foreground">{error}</p>
          {debugInfo && (
            <p className="text-xs text-muted-foreground/60 font-mono break-all">
              {debugInfo}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-3">
        <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Verifying your account…</p>
      </div>
    </div>
  );
}
