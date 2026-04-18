import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Wordmark } from "@/components/Wordmark";
import { Button } from "@/components/ui/button";
import { GoldRule } from "@/components/Ornaments";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

type Row = {
  id: string;
  run_at: string;
  prompt_version: string;
  attack_id: string;
  attack_name: string;
  severity: string;
  status: string;
  reason: string | null;
  raw_snippet: string | null;
};

type StatusFilter = "all" | "pass" | "fail" | "error";

export default function ProtocolRedTeamHistory() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [versionFilter, setVersionFilter] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const { data, error } = await supabase
      .from("redteam_runs")
      .select(
        "id, run_at, prompt_version, attack_id, attack_name, severity, status, reason, raw_snippet",
      )
      .order("run_at", { ascending: false })
      .limit(500);
    if (error) {
      toast.error(`Failed to load history: ${error.message}`);
      setRows([]);
    } else {
      setRows((data ?? []) as Row[]);
    }
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  // Aggregate per prompt version
  const versionAggregates = useMemo(() => {
    const map = new Map<
      string,
      { version: string; total: number; pass: number; fail: number; error: number; lastRun: string }
    >();
    for (const r of rows) {
      const v = r.prompt_version || "unlabelled";
      const cur =
        map.get(v) ?? { version: v, total: 0, pass: 0, fail: 0, error: 0, lastRun: r.run_at };
      cur.total += 1;
      if (r.status === "pass") cur.pass += 1;
      else if (r.status === "fail") cur.fail += 1;
      else if (r.status === "error") cur.error += 1;
      if (new Date(r.run_at) > new Date(cur.lastRun)) cur.lastRun = r.run_at;
      map.set(v, cur);
    }
    return Array.from(map.values()).sort(
      (a, b) => new Date(b.lastRun).getTime() - new Date(a.lastRun).getTime(),
    );
  }, [rows]);

  const versions = useMemo(
    () => Array.from(new Set(rows.map((r) => r.prompt_version))),
    [rows],
  );

  const filteredRows = useMemo(() => {
    return rows
      .filter((r) => (statusFilter === "all" ? true : r.status === statusFilter))
      .filter((r) => (versionFilter === "all" ? true : r.prompt_version === versionFilter))
      .slice(0, 50);
  }, [rows, statusFilter, versionFilter]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const passRate = (a: { pass: number; total: number }) =>
    a.total === 0 ? 0 : Math.round((a.pass / a.total) * 100);

  const statusBadge = (status: string) => {
    const base = "text-xs uppercase tracking-[0.2em] px-3 py-1 rounded-sm";
    if (status === "pass") return <span className={`${base} bg-foreground text-background`}>pass ✓</span>;
    if (status === "fail") return <span className={`${base} bg-rose-soft text-rose-deep`}>fail</span>;
    return <span className={`${base} bg-gold-soft text-gold-deep`}>error</span>;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="flex items-center justify-between px-6 md:px-12 py-6 border-b border-border-soft">
        <Wordmark size="sm" variant="text-only" />
        <div className="flex items-center gap-6 text-sm">
          <Link
            to="/dev/protocol/redteam"
            className="text-muted-foreground hover:text-foreground"
          >
            ← Back to battery
          </Link>
          <Link to="/" className="text-muted-foreground hover:text-foreground">
            Home
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 md:px-12 py-12 md:py-16">
        <div className="mb-10 flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.36em] text-gold-deep mb-4">
              Protocol engine, regression tracker
            </p>
            <h1 className="font-display text-4xl md:text-6xl text-foreground mb-4">
              Red-team history.
            </h1>
            <p className="text-muted-foreground max-w-2xl leading-relaxed">
              Pass rate per prompt version, drawn from every run logged on this account. Tag a
              version label before running the battery to compare across iterations.
            </p>
            <GoldRule className="text-gold mt-8 max-w-xs" />
          </div>
          <Button
            variant="outline"
            className="border-gold text-gold-deep hover:bg-gold-soft"
            onClick={load}
            disabled={loading}
          >
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>

        {!loading && rows.length === 0 && (
          <div className="card-elevated p-10 text-center">
            <h2 className="font-display text-2xl mb-3">No runs yet.</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              Run the adversarial battery and the results will appear here, grouped by the
              prompt version label you set.
            </p>
            <Link to="/dev/protocol/redteam">
              <Button className="btn-primary">Open battery</Button>
            </Link>
          </div>
        )}

        {rows.length > 0 && (
          <>
            {/* Pass rate per version */}
            <section className="card-elevated p-6 mb-10">
              <h2 className="font-display text-2xl mb-4">Pass rate by prompt version</h2>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Version</TableHead>
                    <TableHead className="text-right">Runs</TableHead>
                    <TableHead className="text-right">Pass</TableHead>
                    <TableHead className="text-right">Fail</TableHead>
                    <TableHead className="text-right">Error</TableHead>
                    <TableHead className="text-right">Pass rate</TableHead>
                    <TableHead>Last run</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {versionAggregates.map((a) => {
                    const rate = passRate(a);
                    const rateColor =
                      rate === 100
                        ? "text-foreground"
                        : rate >= 80
                          ? "text-gold-deep"
                          : "text-rose-deep";
                    return (
                      <TableRow key={a.version}>
                        <TableCell className="font-medium">{a.version}</TableCell>
                        <TableCell className="text-right">{a.total}</TableCell>
                        <TableCell className="text-right">{a.pass}</TableCell>
                        <TableCell className="text-right text-rose-deep">{a.fail}</TableCell>
                        <TableCell className="text-right text-gold-deep">{a.error}</TableCell>
                        <TableCell className={`text-right font-semibold ${rateColor}`}>
                          {rate}%
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {formatDate(a.lastRun)}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </section>

            {/* Recent runs */}
            <section className="card-elevated p-6">
              <div className="flex items-center justify-between flex-wrap gap-4 mb-5">
                <h2 className="font-display text-2xl">Recent runs</h2>
                <div className="flex items-center gap-2 flex-wrap">
                  {(["all", "pass", "fail", "error"] as StatusFilter[]).map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatusFilter(s)}
                      className={`text-xs uppercase tracking-[0.2em] px-3 py-1 rounded-sm border transition-colors ${
                        statusFilter === s
                          ? "bg-foreground text-background border-foreground"
                          : "bg-cream text-muted-foreground border-border-soft hover:text-foreground"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                  <select
                    value={versionFilter}
                    onChange={(e) => setVersionFilter(e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-sm bg-cream border border-border-soft text-foreground"
                  >
                    <option value="all">All versions</option>
                    {versions.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>When</TableHead>
                    <TableHead>Version</TableHead>
                    <TableHead>Attack</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRows.map((r) => {
                    const expanded = expandedId === r.id;
                    return (
                      <TableRow
                        key={r.id}
                        className="cursor-pointer"
                        onClick={() => setExpandedId(expanded ? null : r.id)}
                      >
                        <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                          {formatDate(r.run_at)}
                        </TableCell>
                        <TableCell className="text-sm">{r.prompt_version}</TableCell>
                        <TableCell className="text-sm">{r.attack_name}</TableCell>
                        <TableCell>{statusBadge(r.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-md">
                          {r.reason ? (
                            <span className={expanded ? "" : "line-clamp-1"}>{r.reason}</span>
                          ) : (
                            <span className="italic">—</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {filteredRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No runs match the current filters.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </section>
          </>
        )}
      </main>
    </div>
  );
}
