// Role-based access control for the webinar checklist.
//
// Roles mirror the team structure already described in lib/data.ts:
// Team Lead -> admin, Coordinator -> coordinator, Executive -> executive.

export type Role = 'admin' | 'coordinator' | 'executive';

export type Permission =
  | 'checklist:view'
  | 'checklist:complete'
  | 'checklist:note'
  | 'checklist:assign'
  | 'checklist:reset'
  | 'client:viewAll'
  | 'team:viewAll';

const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  admin: [
    'checklist:view',
    'checklist:complete',
    'checklist:note',
    'checklist:assign',
    'checklist:reset',
    'client:viewAll',
    'team:viewAll',
  ],
  coordinator: [
    'checklist:view',
    'checklist:complete',
    'checklist:note',
    'checklist:assign',
    'client:viewAll',
  ],
  executive: ['checklist:view', 'checklist:complete', 'checklist:note'],
};

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Team Lead',
  coordinator: 'Coordinator',
  executive: 'Executive',
};

export function isRole(value: unknown): value is Role {
  return value === 'admin' || value === 'coordinator' || value === 'executive';
}

/** True when `role` is allowed to perform `permission`. */
export function can(role: Role | undefined, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function permissionsFor(role: Role): Permission[] {
  return [...ROLE_PERMISSIONS[role]];
}
