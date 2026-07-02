import { afterEach, describe, expect, it } from "vitest";
import { ACTIONS } from "../actions";
import { can, clearPolicies, hasPermission, registerPolicy } from "../policyEngine";
import { ROLES } from "../roles";

const ceo = { id: "u1", role: ROLES.CEO.id, status: "active" };
const finance = { id: "u2", role: ROLES.FINANCE_OFFICER.id, status: "active" };
const fundraising = { id: "u3", role: ROLES.FUNDRAISING_LEAD.id, status: "active" };

afterEach(() => clearPolicies());

describe("hasPermission", () => {
  it("grants CEO view and comment on every module, but never edit", () => {
    for (const moduleId of ["donor-management", "reporting", "users"]) {
      expect(hasPermission(ceo, ACTIONS.VIEW, moduleId)).toBe(true);
      expect(hasPermission(ceo, ACTIONS.COMMENT, moduleId)).toBe(true);
      expect(hasPermission(ceo, ACTIONS.EDIT, moduleId)).toBe(false);
    }
  });

  it("grants the finance officer full access on every module", () => {
    for (const action of Object.values(ACTIONS)) {
      expect(hasPermission(finance, action, "administration")).toBe(true);
    }
  });

  it("restricts the fundraising lead to donor management", () => {
    expect(hasPermission(fundraising, ACTIONS.EDIT, "donor-management")).toBe(true);
    expect(hasPermission(fundraising, ACTIONS.COMMENT, "donor-management")).toBe(true);
    expect(hasPermission(fundraising, ACTIONS.VIEW, "reporting")).toBe(false);
    expect(hasPermission(fundraising, ACTIONS.EDIT, "users")).toBe(false);
  });
});

describe("can", () => {
  it("denies everything to anonymous and non-active users", () => {
    expect(can(null, ACTIONS.VIEW, "donor-management")).toBe(false);
    expect(can({ ...ceo, status: "pending" }, ACTIONS.VIEW, "donor-management")).toBe(false);
  });

  it("applies registered policies after the permission check", () => {
    registerPolicy({
      module: "donor-management",
      action: ACTIONS.EDIT,
      name: "active-records-only",
      check: ({ resource }) => !resource || resource.active !== false
    });

    expect(can(finance, ACTIONS.EDIT, "donor-management", { resource: { active: true } })).toBe(true);
    expect(can(finance, ACTIONS.EDIT, "donor-management", { resource: { active: false } })).toBe(false);
    // Policy on edit does not affect view.
    expect(can(finance, ACTIONS.VIEW, "donor-management", { resource: { active: false } })).toBe(true);
  });

  it("never lets a policy grant access the role lacks", () => {
    registerPolicy({
      module: "reporting",
      action: ACTIONS.EDIT,
      name: "always-allow",
      check: () => true
    });
    expect(can(fundraising, ACTIONS.EDIT, "reporting")).toBe(false);
  });
});
