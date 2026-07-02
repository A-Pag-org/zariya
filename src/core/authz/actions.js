// Canonical actions a subject can perform on a module or resource.
// New actions (approve, export, delete...) are added here and granted in
// role definitions — no component code changes.

export const ACTIONS = Object.freeze({
  VIEW: "view",
  EDIT: "edit",
  COMMENT: "comment"
});

export const ALL_MODULES = "*";

export function permissionKey(moduleId, action) {
  return `${moduleId}:${action}`;
}
