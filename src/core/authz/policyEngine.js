import { ALL_MODULES } from "./actions";
import { getRole } from "./roles";

// Policy engine — pure functions, no React, fully unit-testable.
//
// Authorization is answered in two stages:
//   1. Permission check  — does any grant cover (module, action)?
//   2. Policy check      — do all registered policies for (module, action)
//                          allow this specific resource / context?
//
// Policies capture the rules roles cannot: ownership, record state, workflow
// stage. They are registered by modules at startup and evaluated only after
// the permission check passes.

const policies = [];

export function registerPolicy({ module, action, name, check }) {
  if (typeof check !== "function") {
    throw new Error(`Policy "${name}" requires a check function.`);
  }
  // Re-registration replaces (keeps hot-module reloads idempotent).
  const existing = policies.findIndex(
    (policy) => policy.name === name && policy.module === module && policy.action === action
  );
  if (existing >= 0) {
    policies[existing] = { module, action, name, check };
  } else {
    policies.push({ module, action, name, check });
  }
}

export function clearPolicies() {
  policies.length = 0;
}

function grantsFor(user) {
  return getRole(user?.role)?.grants ?? [];
}

export function hasPermission(user, action, moduleId) {
  return grantsFor(user).some(
    (grant) =>
      (grant.module === ALL_MODULES || grant.module === moduleId) &&
      grant.actions.includes(action)
  );
}

export function can(user, action, moduleId, context = {}) {
  if (!user || user.status !== "active") return false;
  if (!hasPermission(user, action, moduleId)) return false;

  return policies
    .filter(
      (policy) =>
        (policy.module === ALL_MODULES || policy.module === moduleId) &&
        (policy.action === "*" || policy.action === action)
    )
    .every((policy) => policy.check({ user, action, module: moduleId, ...context }));
}

export function accessibleModuleIds(user, modules, action) {
  return modules.filter((module) => can(user, action, module.id)).map((module) => module.id);
}
