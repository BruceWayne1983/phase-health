import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Wordmark } from "@/components/Wordmark";
import { GoldRule } from "@/components/Ornaments";
import { toast } from "sonner";

const credentialsSchema = z.object({
  email: z.string().trim().email("Enter a valid email").max(255),
  password: z
    .string()
    .min(8, "Minimum 8 characters")
    .max(128, "Maximum 128 characters"),
});

export default function AuthPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { session, loading } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const next = params.get("next") || "/onboarding/age";

  useEffect(() => {
    if (!loading && session) {
      navigate(next, { replace: true });
    }
  }, [session, loading, navigate, next]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = credentialsSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSubmitting(true);
    try {
      if (mode === "signup") {
        const redirectUrl = `${window.location.origin}${next}`;
        const { error } = await supabase.auth.signUp({
          email: parsed.data.email,
          password: parsed.data.password,
          options: { emailRedirectTo: redirectUrl },
        });
        if (error) throw error;
        toast.success("Account created. Welcome.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        if (error) throw error;
        toast.success("Signed in.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Authentication failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="px-6 md:px-12 py-6 border-b border-border-soft">
        <Link to="/" aria-label="Home">
          <Wordmark size="sm" variant="text-only" />
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          <p className="text-xs uppercase tracking-[0.36em] text-gold-deep mb-4">
            {mode === "signup" ? "Create your account" : "Welcome back"}
          </p>
          <h1 className="font-display text-4xl md:text-5xl mb-3">
            {mode === "signup" ? "Begin." : "Sign in."}
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            {mode === "signup"
              ? "Your data stays yours. Encrypted at rest. Never sold."
              : "Pick up where you left off."}
          </p>
          <GoldRule className="text-gold mb-8 max-w-[80px]" />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="eyebrow block mb-2" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-clinical w-full"
                required
              />
            </div>
            <div>
              <label className="eyebrow block mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-clinical w-full"
                required
              />
              {mode === "signup" && (
                <p className="text-xs text-text-dim mt-2">Minimum 8 characters.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full justify-center text-[14px]"
            >
              {submitting
                ? "..."
                : mode === "signup"
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          <p className="text-sm text-muted-foreground mt-8 text-center">
            {mode === "signup" ? "Already have an account?" : "New to Anadya?"}{" "}
            <button
              onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
              className="text-gold-deep hover:text-gold underline underline-offset-4"
            >
              {mode === "signup" ? "Sign in" : "Create one"}
            </button>
          </p>
        </div>
      </main>
    </div>
  );
}
