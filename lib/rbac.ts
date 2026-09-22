// Role-based access control for the webinar checklist.
//
// admin       -> Team Lead    : runs everything, manages clients
// coordinator -> Coordinator  : works checklists, assigns steps to others
// operator    -> Webinar Operator : runs the webinars, fills steps only

export type Role = 'admin' | 'coordinator' | 'operator';

export type Permission =
  | 'checklist:view'
  | 'checklist:complete'
  | 'checklist:note'
  | 'checklist:assign'
  | 'checklist:reset'
  | 'client:viewAll'
  | 'client:create'
  | 'client:edit'
  | 'client:delete'
  | 'team:viewAll';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'checklist:view',
    'checklist:complete',
    'checklist:note',
    'checklist:assign',
    'checklist:reset',
    'client:viewAll',
    'client:create',
    'client:edit',
    'client:delete',
    'team:viewAll',
  ],
  coordinator: [
    'checklist:view',
    'checklist:complete',
    'checklist:note',
    'checklist:assign',
    'client:viewAll',
  ],
  operator: ['checklist:view', 'checklist:complete', 'checklist:note'],
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Team Lead',
  coordinator: 'Coordinator',
  operator: 'Webinar Operator',
};

/**
 * Accepts a stored role. "executive" was the old name for "operator"; it is
 * still mapped so that an APP_USERS value written before the rename does not
 * lock everyone out during a deploy.
 */
export function normalizeRole(value: unknown): Role | undefined {
  if (value === 'admin' || value === 'coordinator' || value === 'operator') return value;
  if (value === 'executive') return 'operator';
  return undefined;
}

export function isRole(value: unknown): value is Role {
  return normalizeRole(value) !== undefined;
}

/** True when `role` is allowed to perform `permission`. */
export function can(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function permissionsFor(role: Role): Permission[] {
  return [...ROLE_PERMISSIONS[role]];
}
