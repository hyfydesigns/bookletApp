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

  useEffect(() => {
    const supabase = createClient();

    async function handleAuth() {
      // 1. Hash-based (implicit flow): Supabase puts access_token in the URL hash.
      //    The browser client detects this automatically via getSession().
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await syncUser();
        router.replace("/dashboard");
        return;
      }

      // 2. PKCE code in query params (e.g. ?code=xxx)
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) {
          await syncUser();
          router.replace("/dashboard");
          return;
        }
      }

      // 3. token_hash + type (email OTP — invite, magic link, recovery)
      const token_hash = params.get("token_hash");
      const type = params.get("type");
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as EmailOtpType,
        });
        if (!error) {
          await syncUser();
          router.replace("/dashboard");
          return;
        }
      }

      setError("This link is invalid or has expired. Please ask your admin to send a new invitation.");
    }

    handleAuth();
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3 max-w-sm px-4">
          <p className="font-semibold text-destructive">Link expired</p>
          <p className="text-sm text-muted-foreground">{error}</p>
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
