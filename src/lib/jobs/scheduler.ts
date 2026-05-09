/**
 * Background Jobs System
 * Scheduler and queue abstraction for periodic tasks
 */

/**
 * Job status
 */
export type JobStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

/**
 * Job priority
 */
export type JobPriority = "low" | "normal" | "high" | "critical";

/**
 * Job definition
 */
export interface JobDefinition {
  id: string;
  name: string;
  description?: string;
  handler: () => Promise<void>;
  schedule?: string;          // Cron expression
  interval?: number;          // Interval in milliseconds
  priority?: JobPriority;
  maxRetries?: number;
  retryDelay?: number;        // Milliseconds
  timeout?: number;           // Milliseconds
  enabled?: boolean;
}

/**
 * Job execution record
 */
export interface JobExecution {
  id: string;
  jobId: string;
  status: JobStatus;
  startedAt: Date;
  completedAt?: Date;
  duration?: number;
  error?: string;
  retryCount: number;
}

/**
 * Job registry
 */
const jobRegistry = new Map<string, JobDefinition>();

/**
 * Execution history
 */
const executionHistory: JobExecution[] = [];
const MAX_HISTORY = 100;

/**
 * Active job timers
 */
const activeTimers = new Map<string, NodeJS.Timeout>();

/**
 * Currently running jobs
 */
const runningJobs = new Set<string>();

/**
 * Register a job
 */
export function registerJob(job: JobDefinition): void {
  jobRegistry.set(job.id, {
    priority: "normal",
    maxRetries: 3,
    retryDelay: 5000,
    timeout: 60000,
    enabled: true,
    ...job,
  });
}

/**
 * Unregister a job
 */
export function unregisterJob(jobId: string): void {
  stopJob(jobId);
  jobRegistry.delete(jobId);
}

/**
 * Get all registered jobs
 */
export function getJobs(): JobDefinition[] {
  return Array.from(jobRegistry.values());
}

/**
 * Get job by ID
 */
export function getJob(jobId: string): JobDefinition | undefined {
  return jobRegistry.get(jobId);
}

/**
 * Run a job once
 */
export async function runJob(jobId: string): Promise<JobExecution> {
  const job = jobRegistry.get(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  if (runningJobs.has(jobId)) {
    throw new Error(`Job ${jobId} is already running`);
  }

  const execution: JobExecution = {
    id: `exec_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    jobId,
    status: "running",
    startedAt: new Date(),
    retryCount: 0,
  };

  runningJobs.add(jobId);

  try {
    // Run with timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error("Job timeout")), job.timeout);
    });

    await Promise.race([job.handler(), timeoutPromise]);

    execution.status = "completed";
    execution.completedAt = new Date();
    execution.duration = execution.completedAt.getTime() - execution.startedAt.getTime();
  } catch (error) {
    execution.status = "failed";
    execution.completedAt = new Date();
    execution.duration = execution.completedAt.getTime() - execution.startedAt.getTime();
    execution.error = error instanceof Error ? error.message : String(error);

    // Retry logic
    if (execution.retryCount < (job.maxRetries ?? 3)) {
      execution.retryCount++;
      console.log(`Job ${jobId} failed, retrying (${execution.retryCount}/${job.maxRetries})...`);

      await new Promise((resolve) => setTimeout(resolve, job.retryDelay));
      return runJob(jobId);
    }
  } finally {
    runningJobs.delete(jobId);
  }

  // Add to history
  executionHistory.unshift(execution);
  if (executionHistory.length > MAX_HISTORY) {
    executionHistory.pop();
  }

  return execution;
}

/**
 * Start a scheduled job
 */
export function startJob(jobId: string): void {
  const job = jobRegistry.get(jobId);
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  if (!job.enabled) {
    console.log(`Job ${jobId} is disabled, not starting`);
    return;
  }

  // Stop existing timer if any
  stopJob(jobId);

  if (job.interval) {
    // Interval-based scheduling
    const timer = setInterval(async () => {
      try {
        await runJob(jobId);
      } catch (error) {
        console.error(`Job ${jobId} failed:`, error);
      }
    }, job.interval);

    activeTimers.set(jobId, timer);
    console.log(`Started job ${jobId} with interval ${job.interval}ms`);
  } else if (job.schedule) {
    // Cron-based scheduling (simplified - just parse basic cron)
    const nextRun = getNextCronRun(job.schedule);
    const delay = nextRun.getTime() - Date.now();

    if (delay > 0) {
      const timer = setTimeout(async () => {
        try {
          await runJob(jobId);
        } catch (error) {
          console.error(`Job ${jobId} failed:`, error);
        }
        // Reschedule
        startJob(jobId);
      }, delay);

      activeTimers.set(jobId, timer);
      console.log(`Scheduled job ${jobId} for ${nextRun.toISOString()}`);
    }
  }
}

/**
 * Stop a scheduled job
 */
export function stopJob(jobId: string): void {
  const timer = activeTimers.get(jobId);
  if (timer) {
    clearInterval(timer);
    clearTimeout(timer);
    activeTimers.delete(jobId);
    console.log(`Stopped job ${jobId}`);
  }
}

/**
 * Start all enabled jobs
 */
export function startAllJobs(): void {
  for (const job of jobRegistry.values()) {
    if (job.enabled && (job.interval || job.schedule)) {
      startJob(job.id);
    }
  }
}

/**
 * Stop all jobs
 */
export function stopAllJobs(): void {
  for (const jobId of activeTimers.keys()) {
    stopJob(jobId);
  }
}

/**
 * Get execution history
 */
export function getExecutionHistory(jobId?: string): JobExecution[] {
  if (jobId) {
    return executionHistory.filter((e) => e.jobId === jobId);
  }
  return [...executionHistory];
}

/**
 * Get last execution for a job
 */
export function getLastExecution(jobId: string): JobExecution | undefined {
  return executionHistory.find((e) => e.jobId === jobId);
}

/**
 * Check if a job is running
 */
export function isJobRunning(jobId: string): boolean {
  return runningJobs.has(jobId);
}

/**
 * Enable/disable a job
 */
export function setJobEnabled(jobId: string, enabled: boolean): void {
  const job = jobRegistry.get(jobId);
  if (job) {
    job.enabled = enabled;
    if (!enabled) {
      stopJob(jobId);
    }
  }
}

/**
 * Parse simple cron expression and get next run time
 * Supports: minute hour day month dayOfWeek
 * Special values: asterisk (any), asterisk/n (every n)
 */
function getNextCronRun(cronExpression: string): Date {
  const parts = cronExpression.split(" ");
  if (parts.length !== 5) {
    throw new Error("Invalid cron expression");
  }

  const now = new Date();
  const next = new Date(now);
  next.setSeconds(0);
  next.setMilliseconds(0);

  // Simple implementation: just handle common patterns
  const [minute, hour] = parts;

  if (minute === "*" && hour === "*") {
    // Every minute
    next.setMinutes(next.getMinutes() + 1);
  } else if (minute?.startsWith("*/")) {
    // Every N minutes
    const interval = parseInt(minute.slice(2), 10);
    const currentMinute = next.getMinutes();
    const nextMinute = Math.ceil((currentMinute + 1) / interval) * interval;
    if (nextMinute >= 60) {
      next.setHours(next.getHours() + 1);
      next.setMinutes(0);
    } else {
      next.setMinutes(nextMinute);
    }
  } else if (hour === "*") {
    // Specific minute every hour
    const targetMinute = parseInt(minute!, 10);
    if (next.getMinutes() >= targetMinute) {
      next.setHours(next.getHours() + 1);
    }
    next.setMinutes(targetMinute);
  } else {
    // Specific time
    const targetMinute = parseInt(minute!, 10);
    const targetHour = parseInt(hour!, 10);

    next.setHours(targetHour);
    next.setMinutes(targetMinute);

    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }
  }

  return next;
}

/**
 * Job statistics
 */
export function getJobStats(): {
  totalJobs: number;
  enabledJobs: number;
  runningJobs: number;
  recentExecutions: number;
  failedExecutions: number;
  averageDuration: number;
} {
  const recent = executionHistory.slice(0, 20);
  const failed = recent.filter((e) => e.status === "failed").length;
  const completed = recent.filter((e) => e.status === "completed" && e.duration);
  const avgDuration =
    completed.length > 0
      ? completed.reduce((sum, e) => sum + (e.duration ?? 0), 0) / completed.length
      : 0;

  return {
    totalJobs: jobRegistry.size,
    enabledJobs: Array.from(jobRegistry.values()).filter((j) => j.enabled).length,
    runningJobs: runningJobs.size,
    recentExecutions: recent.length,
    failedExecutions: failed,
    averageDuration: Math.round(avgDuration),
  };
}
