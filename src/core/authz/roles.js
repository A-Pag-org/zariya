import { ACTIONS, ALL_MODULES } from "./actions";

// Roles are pure data: named bundles of permission grants. The engine never
// branches on a role name, so adding a role is a data change, not a code change.
//
// A grant is { module, actions } where module is a module id or "*" (all).

export const ROLES = Object.freeze({
  CEO: {
    id: "ceo",
    label: "CEO",
    description: "View and comment across every module.",
    grants: [{ module: ALL_MODULES, actions: [ACTIONS.VIEW, ACTIONS.COMMENT] }]
  },
  FINANCE_OFFICER: {
    id: "finance-officer",
    label: "Accounts / Finance Officer",
    description: "View, edit and comment across every module.",
    grants: [{ module: ALL_MODULES, actions: [ACTIONS.VIEW, ACTIONS.EDIT, ACTIONS.COMMENT] }]
  },
  FUNDRAISING_LEAD: {
    id: "fundraising-lead",
    label: "Fund Raising Lead",
    description: "View, edit and comment on Donor Management only.",
    grants: [
      { module: "donor-management", actions: [ACTIONS.VIEW, ACTIONS.EDIT, ACTIONS.COMMENT] },
      // Every signed-in user can see their landing dashboard.
      { module: "dashboard", actions: [ACTIONS.VIEW] }
    ]
  }
});

export const ROLE_LIST = Object.values(ROLES);

export function getRole(roleId) {
  return ROLE_LIST.find((role) => role.id === roleId) ?? null;
}
