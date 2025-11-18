import { router } from '../trpc'
import { userRouter } from './user'
import { learningRouter } from './learning'

export const appRouter = router({
  user: userRouter,
  learning: learningRouter,
})

export type AppRouter = typeof appRouter

