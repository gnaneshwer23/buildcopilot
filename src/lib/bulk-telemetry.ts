import { BulkExecutionTelemetry } from "@/lib/buildcopilot-types";

export function buildBaseBulkTelemetry(options: {
  startedAt: Date;
  completedAt: Date;
  totalTasks: number;
  concurrencyLimit: number;
}): Omit<BulkExecutionTelemetry, "errorBuckets"> {
  const queuedTasks = Math.max(options.totalTasks - options.concurrencyLimit, 0);

  return {
    startedAt: options.startedAt.toISOString(),
    completedAt: options.completedAt.toISOString(),
    durationMs: Math.max(options.completedAt.getTime() - options.startedAt.getTime(), 0),
    totalTasks: options.totalTasks,
    concurrencyLimit: options.concurrencyLimit,
    queuedTasks,
    peakQueueDepth: queuedTasks,
  };
}

export function bucketCount(entries: string[]): Record<string, number> {
  const buckets: Record<string, number> = {};

  for (const key of entries) {
    buckets[key] = (buckets[key] ?? 0) + 1;
  }

  return buckets;
}
