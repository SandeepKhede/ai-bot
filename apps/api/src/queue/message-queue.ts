import { Queue, Worker, type Job } from 'bullmq'
import { routeMessage } from '../services/message-router'

const connection = {
  host: process.env.REDIS_HOST ?? 'localhost',
  port: Number(process.env.REDIS_PORT ?? 6379),
}

export interface MessageJob {
  phoneNumberId: string
  from: string
  text: string
}

export const messageQueue = new Queue<MessageJob>('messages', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 2000 },
    removeOnComplete: { count: 500 },  // keep last 500 completed jobs
    removeOnFail: { count: 200 },      // keep last 200 failed jobs for inspection
  },
})

export function createMessageWorker() {
  const worker = new Worker<MessageJob>(
    'messages',
    async (job: Job<MessageJob>) => {
      const { phoneNumberId, from, text } = job.data
      await routeMessage(phoneNumberId, from, text)
    },
    {
      connection,
      concurrency: 10,
    }
  )

  worker.on('failed', (job, err) => {
    console.error(`[queue] job ${job?.id} failed (attempt ${job?.attemptsMade}/${job?.opts.attempts}):`, err.message)
  })

  worker.on('error', (err) => {
    console.error('[queue] worker error:', err.message)
  })

  return worker
}
