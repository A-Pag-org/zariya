import { useCallback } from "react";
import { useAuth } from "../auth/useAuth";
import { can } from "./policyEngine";

// Single authorization hook for components. Returns a stable checker:
//   const canDo = useCan();
//   canDo(ACTIONS.EDIT, "donor-management", { resource: donor })
export function useCan() {
  const { user } = useAuth();
  return useCallback(
    (action, moduleId, context) => can(user, action, moduleId, context),
    [user]
  );
}
