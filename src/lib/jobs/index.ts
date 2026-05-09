/**
 * Background Jobs Module
 * Scheduler and queue system for periodic tasks
 */

export {
  registerJob,
  unregisterJob,
  getJobs,
  getJob,
  runJob,
  startJob,
  stopJob,
  startAllJobs,
  stopAllJobs,
  getExecutionHistory,
  getLastExecution,
  isJobRunning,
  setJobEnabled,
  getJobStats,
  type JobDefinition,
  type JobExecution,
  type JobStatus,
  type JobPriority,
} from "./scheduler";

export { registerPlatformJobs, JOB_GROUPS } from "./platform-jobs";
