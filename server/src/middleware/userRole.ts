import { Request, Response, NextFunction } from "express";
import { getPermission } from "../utils/premissition";
import { TokenPayload } from "./verifyTokens";
import type { Resource, Action } from "../utils/premissition";

export const checkPermission = (resource: Resource,action: Action,getOwnerId?: (req: Request) => Promise<string> | string 
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as TokenPayload;
    if (!user) {
       res.status(401).json({ message: "Not authenticated" });
       return
    }

    const permission = getPermission(user.userRole, resource, action);
    if (!permission) {
       res.status(403).json({ message: "Access denied" });
       return
    }

    if (permission.scope === "own") {
      let ownerId: string | undefined;

      if (getOwnerId) {
        ownerId = typeof getOwnerId === "function" ? await getOwnerId(req) : undefined;
      } else {
        ownerId = req.params.id; // fallback
      }

      if (!ownerId || ownerId !== user.userId) {
         res.status(403).json({ message: "Access denied: own resource only" });
         return
      }
    }

     next();
     return
  };
};
