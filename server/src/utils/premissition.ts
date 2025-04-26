export type Role = "ADMINISTRATOR" | "PHARMACIST" | "PATIENT";
export type Resource = "administrators"|"patients" | "pharmacists" |"medicines" | "cart"| "chat";
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
    { resource: "pharmacists", action: "read", scope: "any" }, 
    { resource: "pharmacists", action: "update", scope: "any" },
    { resource: "medicines", action: "read", scope: "any" }, 


    { resource: "chat", action: "read", scope: "any" },
    { resource: "chat", action: "create", scope: "any" },
    { resource: "chat", action: "update", scope: "any" },
  ],

  PHARMACIST: [
    { resource : "pharmacists", action: "read", scope: "own" },
    { resource: "pharmacists", action: "update", scope: "own" }, 
    { resource: "patients", action: "read", scope: "any" }, 
    { resource : "medicines", action: "read", scope: "any" }, 

    { resource: "chat", action: "read", scope: "own" },
    { resource: "chat", action: "create", scope: "own" },
    { resource: "chat", action: "update", scope: "own" },

  ],

  PATIENT: [
    { resource: "patients", action: "read", scope: "own" },
    { resource :"patients",action: "delete", scope: "own" },
    { resource: "patients", action: "update", scope: "own" },
    { resource: "pharmacists", action: "read", scope: "any" },
    { resource: "medicines", action: "read", scope: "any" }, 
    
    { resource: "cart", action: "read", scope: "own" },
    { resource: "cart", action: "create", scope: "own" }, 
    { resource: "cart", action: "update", scope: "own" }, 
    { resource: "cart", action: "delete", scope: "own" }, 

    { resource: "chat", action: "read", scope: "own" },
    { resource: "chat", action: "create", scope: "own" },
    { resource: "chat", action: "update", scope: "own" },
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
