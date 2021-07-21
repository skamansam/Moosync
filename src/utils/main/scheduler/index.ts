import { AsyncTask, SimpleIntervalJob, ToadScheduler } from 'toad-scheduler';

import { scannerChannel } from '@/utils/main/ipc';

export const scheduler = new ToadScheduler()

export function setupScanTask() {
  const task = new AsyncTask(
    'scan task',
    () => scannerChannel.ScanSongs(),
    (err: Error) => { console.log(err) }
  )

  const job = new SimpleIntervalJob({ hours: 1, }, task)

  scheduler.addSimpleIntervalJob(job)
}