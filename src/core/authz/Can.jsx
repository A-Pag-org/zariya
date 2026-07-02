import { useCan } from "./useCan";

// Declarative permission gate.
//
//   <Can action={ACTIONS.EDIT} module="donor-management" resource={donor}>
//     <Button>Edit</Button>
//   </Can>
//
// `fallback` renders when access is denied (defaults to nothing).
export function Can({ action, module, resource, context, fallback = null, children }) {
  const canDo = useCan();
  const allowed = canDo(action, module, { resource, ...context });

  if (!allowed) return fallback;
  return typeof children === "function" ? children() : children;
}
