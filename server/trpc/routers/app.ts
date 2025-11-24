import { router } from '../trpc'
import { userRouter } from './user'
import { learningRouter } from './learning'
import { adminRouter } from './admin'

export const appRouter = router({
  user: userRouter,
  learning: learningRouter,
  admin: adminRouter,
})

export type AppRouter = typeof appRouter

