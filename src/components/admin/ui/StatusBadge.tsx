/**
 * The statuses the admin surfaces actually produce.
 *
 * Keeping the tone map keyed by this union means every declared status is
 * covered, and it gives callers a type to narrow to when they can.
 */
export type KnownStatus =
  | "active"
  | "success"
  | "healthy"
  | "completed"
  | "pending"
  | "forming"
  | "paused"
  | "degraded"
  | "warning"
  | "suspended"
  | "failed"
  | "down"
  | "critical"
  | "deposit"
  | "payout"
  | "info";

const TONE: Record<KnownStatus, string> = {
  // positive
  active: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  success: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  healthy: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  completed: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
  // warning
  pending: "bg-amber-50 text-amber-700 ring-amber-600/20",
  forming: "bg-amber-50 text-amber-700 ring-amber-600/20",
  paused: "bg-amber-50 text-amber-700 ring-amber-600/20",
  degraded: "bg-amber-50 text-amber-700 ring-amber-600/20",
  warning: "bg-amber-50 text-amber-700 ring-amber-600/20",
  // danger
  suspended: "bg-rose-50 text-rose-700 ring-rose-600/20",
  failed: "bg-rose-50 text-rose-700 ring-rose-600/20",
  down: "bg-rose-50 text-rose-700 ring-rose-600/20",
  critical: "bg-rose-50 text-rose-700 ring-rose-600/20",
  // informational
  deposit: "bg-sky-50 text-sky-700 ring-sky-600/20",
  payout: "bg-sky-50 text-sky-700 ring-sky-600/20",
  info: "bg-sky-50 text-sky-700 ring-sky-600/20",
};

const NEUTRAL = "bg-slate-50 text-slate-600 ring-slate-500/20";

/** True only for a declared tone key; inherited properties are never matched. */
function isKnownStatus(value: string): value is KnownStatus {
  return Object.prototype.hasOwnProperty.call(TONE, value);
}

/**
 * Resolves the tone for a status string.
 *
 * Anything that was not declared falls back to the neutral tone. The
 * `hasOwnProperty` check is what makes that true for keys such as
 * `constructor` or `toString`: a bare `TONE[status]` lookup would resolve them
 * to a truthy member of `Object.prototype`, defeating the `?? NEUTRAL` fallback
 * and interpolating a stringified function into the class list.
 */
export function toneFor(status: string): string {
  const key = status.toLowerCase();
  return isKnownStatus(key) ? TONE[key] : NEUTRAL;
}

/**
 * Small pill that colour-codes a status/label string by semantic tone.
 *
 * `status` stays a `string` on purpose: it is fed from several independent data
 * unions (`AccountStatus`, `GroupStatus`, `TransactionType`, `UserRole`) and
 * from API payloads, so unknown values must degrade to the neutral tone rather
 * than fail to compile.
 */
export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset ${toneFor(status)}`}
    >
      {status}
    </span>
  );
}
