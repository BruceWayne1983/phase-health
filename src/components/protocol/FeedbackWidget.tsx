// Inline feedback capture for a generated protocol.
// Persists to protocols.user_feedback (1-5) + protocols.user_feedback_text (free text)
// via RLS-protected UPDATE on the row the current user owns.

import { useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const feedbackSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().max(2000).optional(),
});

type Props = {
  protocolId: string;
  initialRating?: number | null;
  initialText?: string | null;
};

export function FeedbackWidget({ protocolId, initialRating, initialText }: Props) {
  const [rating, setRating] = useState<number | null>(initialRating ?? null);
  const [hover, setHover] = useState<number | null>(null);
  const [text, setText] = useState(initialText ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<boolean>(
    Boolean(initialRating || (initialText && initialText.length > 0)),
  );

  async function submit() {
    if (rating == null) {
      toast.error("Pick a rating from 1 to 5.");
      return;
    }
    const parsed = feedbackSchema.safeParse({ rating, text: text || undefined });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0].message);
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from("protocols")
      .update({
        user_feedback: parsed.data.rating,
        user_feedback_text: parsed.data.text ?? null,
      })
      .eq("id", protocolId);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSaved(true);
    toast.success("Thank you. Logged for the engine team.");
  }

  return (
    <section
      aria-label="Protocol feedback"
      className="mt-12 border-t border-border-soft pt-10"
    >
      <p className="text-xs uppercase tracking-[0.36em] text-gold-deep mb-3">
        Your feedback
      </p>
      <h3 className="font-display text-2xl mb-2">Did this protocol resonate?</h3>
      <p className="text-sm text-muted-foreground mb-6 max-w-xl leading-relaxed">
        Honest ratings sharpen the engine. We read every note, every week.
      </p>

      {/* Star rating */}
      <div
        role="radiogroup"
        aria-label="Rate this protocol from 1 to 5"
        className="flex gap-2 mb-6"
      >
        {[1, 2, 3, 4, 5].map((n) => {
          const active = (hover ?? rating ?? 0) >= n;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={rating === n}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(null)}
              onClick={() => setRating(n)}
              className={`w-11 h-11 rounded-full border transition flex items-center justify-center text-lg ${
                active
                  ? "border-gold bg-gold-soft text-gold-deep"
                  : "border-border-soft text-text-dim hover:border-gold"
              }`}
            >
              {active ? "★" : "☆"}
            </button>
          );
        })}
      </div>

      <label htmlFor="feedback_text" className="eyebrow block mb-2">
        Notes (optional)
      </label>
      <textarea
        id="feedback_text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        maxLength={2000}
        placeholder="What landed? What missed? What would you have written instead?"
        className="input-clinical w-full resize-none mb-4"
      />

      <div className="flex items-center gap-4 flex-wrap">
        <Button
          className="btn-primary"
          onClick={submit}
          disabled={saving || rating == null}
        >
          {saving ? "Saving..." : saved ? "Update feedback" : "Submit feedback"}
        </Button>
        {saved && (
          <p className="text-xs uppercase tracking-[0.2em] text-gold-deep">
            Logged
          </p>
        )}
      </div>
    </section>
  );
}
