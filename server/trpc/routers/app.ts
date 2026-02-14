import { router } from '../trpc'
import { userRouter } from './user'
import { learningRouter } from './learning'
import { adminRouter } from './admin'
import { rbacRouter } from './rbac'
import { kanbanRouter } from './kanban'
import { projectsRouter } from './projects'
import { announcementsRouter } from './announcements'
import { ragRouter } from './rag'
import { auditRouter } from './audit'

export const appRouter = router({
  user: userRouter,
  learning: learningRouter,
  admin: adminRouter,
  rbac: rbacRouter,
  kanban: kanbanRouter,
  projects: projectsRouter,
  announcements: announcementsRouter,
  rag: ragRouter,
  audit: auditRouter,
})

export type AppRouter = typeof appRouter
