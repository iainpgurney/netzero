import { DefaultSession } from 'next-auth'

type SystemRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'MEMBER'

interface ModuleAccess {
  moduleId: string
  moduleSlug: string
  moduleName: string
  canView: boolean
  canEdit: boolean
  canManage: boolean
}

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      role: SystemRole
      departmentId: string | null
      departmentName: string | null
      departmentSlug: string | null
      modules: ModuleAccess[]
    } & DefaultSession['user']
  }

  interface User {
    role?: SystemRole
    departmentId?: string | null
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: SystemRole
    departmentId?: string | null
    departmentName?: string | null
    departmentSlug?: string | null
    modules?: ModuleAccess[]
  }
}