export type Role = "ADMINISTRATOR" | "PHARMACIST" | "PATIENT";
export type Resource = "administrators"|"patients" | "pharmacists" | "prescriptions";
export type Action = "read" | "create" | "update" | "delete";
export type Scope = "own" | "any";

export interface Permission {
  resource: Resource;
  action: Action;
  scope: Scope;
}

const rolePermissions: Record<Role, Permission[]> = {
  ADMINISTRATOR: [
    { resource: "administrators", action: "read", scope: "any" },
    { resource: "administrators", action: "create", scope: "any" },
    { resource: "administrators", action: "delete", scope: "any" },
    { resource: "patients", action: "read", scope: "any" },
    { resource: "patients", action: "update", scope: "any" },
    { resource: "patients",action:"delete", scope: "any" },
    { resource: "pharmacists", action: "read", scope: "any" }, // يشوف كل الصيادلة
    { resource: "pharmacists", action: "update", scope: "any" },
    { resource: "prescriptions", action: "read", scope: "any" },
    { resource: "prescriptions", action: "create", scope: "any" },
    { resource: "prescriptions", action: "update", scope: "any" },
    { resource: "prescriptions", action: "delete", scope: "any" },
  ],

  PHARMACIST: [
    { resource : "pharmacists", action: "read", scope: "own" }, // يشوف معلوماته بس
    { resource: "pharmacists", action: "update", scope: "own" }, // يعدل على معلوماته بس
    { resource: "patients", action: "read", scope: "any" }, // ممكن يشوف كل المرضى
    { resource: "prescriptions", action: "create", scope: "any" }, // يكتب وصفة لأي مريض
    { resource: "prescriptions", action: "read", scope: "any" },
    { resource: "prescriptions", action: "update", scope: "own" }, // يعدل على وصفاته بس
  ],

  PATIENT: [
    { resource: "patients", action: "read", scope: "own" },
    { resource :"patients",action: "delete", scope: "own" },
    { resource: "patients", action: "update", scope: "own" },
    { resource: "pharmacists", action: "read", scope: "any" }, // يشوف كل الصيادلة
    { resource: "prescriptions", action: "read", scope: "own" },
  ],
};

export function getPermission(
  role: Role,
  resource: Resource,
  action: Action
): Permission | null {
  const perms = rolePermissions[role] || [];
  return perms.find(p => p.resource === resource && p.action === action) || null;
}
