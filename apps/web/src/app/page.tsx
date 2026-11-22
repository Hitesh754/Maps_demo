"use client";

import React, { useEffect, useState, useCallback } from "react";
import { createApiClient, ProblemDetailsError, ApiClientError } from "@meridian/api-client";
import type { ReadyResponse } from "@meridian/contracts";

type ProbeState =
  | { status: "loading" }
  | { status: "ready"; data: ReadyResponse }
  | { status: "degraded"; detail: string; checks?: ReadyResponse["checks"] }
  | { status: "unreachable"; message: string };

export default function HomePage() {
  const [probe, setProbe] = useState<ProbeState>({ status: "loading" });
  const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8080";

  const probeReadiness = useCallback(async () => {
    setProbe({ status: "loading" });
    const client = createApiClient({ baseUrl: apiUrl, defaultTimeoutMs: 4000 });

    try {
      const ready = await client.getReady();
      setProbe({ status: "ready", data: ready });
    } catch (err: unknown) {
      if (err instanceof ProblemDetailsError) {
        setProbe({
          status: "degraded",
          detail: err.problem.detail || err.problem.title || "Service degraded",
        });
      } else if (err instanceof ApiClientError) {
        setProbe({
          status: "unreachable",
          message: `${err.message} (Probed: ${apiUrl})`,
        });
      } else {
        setProbe({
          status: "unreachable",
          message: err instanceof Error ? err.message : "Unknown connectivity failure",
        });
      }
    }
  }, [apiUrl]);

  useEffect(() => {
    probeReadiness();
  }, [probeReadiness]);

  return (
    <main className="min-h-screen p-6 md:p-12 max-w-4xl mx-auto flex flex-col gap-8">
      {/* Platform Header */}
      <header className="border-b border-[var(--color-border)] pb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="w-3 h-3 rounded-full bg-[var(--color-accent)] ring-4 ring-blue-500/20" />
            <h1 className="text-2xl font-bold tracking-tight">Meridian</h1>
          </div>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Geospatial Intelligence Platform • Foundation v0.1.0
          </p>
        </div>
        <button
          onClick={probeReadiness}
          className="self-start md:self-auto px-4 py-2 text-xs font-medium rounded-md bg-[var(--color-surface)] border border-[var(--color-border)] hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          Re-probe Readiness
        </button>
      </header>

      {/* Cluster Readiness Card */}
      <section className="bg-[var(--color-surface)] rounded-xl border border-[var(--color-border)] p-6 shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">Backend Infrastructure Readiness</h2>
          <span className="text-xs text-[var(--color-text-muted)] font-mono">{apiUrl}</span>
        </div>

        {probe.status === "loading" && (
          <div className="p-6 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] flex items-center gap-4 animate-pulse">
            <div className="w-4 h-4 rounded-full bg-slate-400" />
            <span className="text-sm text-[var(--color-text-secondary)]">
              Probing cluster readiness via /readyz...
            </span>
          </div>
        )}

        {probe.status === "ready" && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 rounded-full bg-[var(--color-status-ok)]" />
                <span className="text-sm font-medium text-emerald-900 dark:text-emerald-200">
                  Cluster Status: All Systems Operational
                </span>
              </div>
              <span className="text-xs font-mono text-emerald-700 dark:text-emerald-300">
                {probe.data.timestamp}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] flex flex-col gap-1">
                <span className="text-xs text-[var(--color-text-secondary)]">PostgreSQL + PostGIS</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {probe.data.checks.postgres ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] flex flex-col gap-1">
                <span className="text-xs text-[var(--color-text-secondary)]">NATS JetStream</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {probe.data.checks.nats ? "Connected" : "Disconnected"}
                </span>
              </div>
              <div className="p-4 rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] flex flex-col gap-1">
                <span className="text-xs text-[var(--color-text-secondary)]">S3 Object Storage</span>
                <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {probe.data.checks.s3 ? "Connected" : "Disconnected"}
                </span>
              </div>
            </div>
          </div>
        )}

        {probe.status === "degraded" && (
          <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[var(--color-status-warning)]" />
              <span className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                Cluster Degraded (RFC 9457 Problem Details)
              </span>
            </div>
            <p className="text-xs text-amber-800 dark:text-amber-300">{probe.detail}</p>
          </div>
        )}

        {probe.status === "unreachable" && (
          <div className="p-4 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 rounded-full bg-[var(--color-status-danger)]" />
              <span className="text-sm font-semibold text-rose-900 dark:text-rose-200">
                API Cluster Unreachable
              </span>
            </div>
            <p className="text-xs text-rose-800 dark:text-rose-300">{probe.message}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              Ensure the dev stack is running (`pnpm dev:stack`) and port 8080 is reachable.
            </p>
          </div>
        )}
      </section>

      {/* Attribution footer */}
      <footer className="mt-auto text-xs text-[var(--color-text-muted)] flex justify-between border-t border-[var(--color-border)] pt-4">
        <span>© Meridian Geospatial Intelligence</span>
        <span>Map data © OpenStreetMap contributors</span>
      </footer>
    </main>
  );
}
