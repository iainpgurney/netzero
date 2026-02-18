// ==========================================
// RBAC Constants and Utilities
// ==========================================

export type SystemRole = 'SUPER_ADMIN' | 'ADMIN' | 'MANAGER' | 'MEMBER'

export interface ModuleAccess {
  moduleId: string
  moduleSlug: string
  moduleName: string
  canView: boolean
  canEdit: boolean
  canManage: boolean
}

// Role hierarchy - higher number = more privilege
export const ROLE_HIERARCHY: Record<SystemRole, number> = {
  MEMBER: 0,
  MANAGER: 1,
  ADMIN: 2,
  SUPER_ADMIN: 3,
}

// Check if a role meets the minimum required role
export function hasMinimumRole(userRole: SystemRole, requiredRole: SystemRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole]
}

// Department definitions with icons and colors — must match Google OUs
export const DEPARTMENTS = [
  { name: 'Board', slug: 'board', icon: '👑', color: '#6B21A8', description: 'Board of Directors and Governance' },
  { name: 'C Suite', slug: 'c-suite', icon: '🏢', color: '#1D4ED8', description: 'Executive Leadership Team' },
  { name: 'Customer Support', slug: 'customer-support', icon: '🎧', color: '#0891B2', description: 'Customer Service & Support' },
  { name: 'Development', slug: 'development', icon: '💻', color: '#7C3AED', description: 'Product & Software Development' },
  { name: 'Finance', slug: 'finance', icon: '💰', color: '#059669', description: 'Finance, Accounting & Treasury' },
  { name: 'Operations', slug: 'operations', icon: '⚙️', color: '#4B5563', description: 'Operations & Supply Chain' },
  { name: 'Product', slug: 'product', icon: '📦', color: '#D97706', description: 'Product Strategy & Roadmap' },
  { name: 'Rev Ops', slug: 'rev-ops', icon: '📊', color: '#059669', description: 'Revenue Operations & Analytics' },
] as const

// Platform module definitions
export const PLATFORM_MODULES = [
  {
    name: 'Training',
    slug: 'training',
    icon: '🎓',
    color: '#059669',
    route: '/dashboard',
    description: 'Learning hub with courses, certifications, and professional development',
  },
  {
    name: 'Management',
    slug: 'management',
    icon: '📊',
    color: '#1D4ED8',
    route: '/management',
    description: 'Team management, performance tracking, and resource planning',
  },
  {
    name: 'BCorp',
    slug: 'bcorp',
    icon: '🌱',
    color: '#16A34A',
    route: '/bcorp',
    description: 'B Corporation certification tracking, impact assessment, and compliance',
  },
  {
    name: 'RAG Dashboard',
    slug: 'rag',
    icon: '🚦',
    color: '#00D97E',
    route: '/intranet/rag',
    description: 'Red/Amber/Green department health status tracker for executive oversight',
  },
] as const

// Role labels for display
export const ROLE_LABELS: Record<SystemRole, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  MEMBER: 'Member',
}

// Role badge colors
export const ROLE_COLORS: Record<SystemRole, string> = {
  SUPER_ADMIN: 'bg-red-100 text-red-800 border-red-200',
  ADMIN: 'bg-purple-100 text-purple-800 border-purple-200',
  MANAGER: 'bg-blue-100 text-blue-800 border-blue-200',
  MEMBER: 'bg-gray-100 text-gray-800 border-gray-200',
}
