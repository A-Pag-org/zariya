import { ACTIONS, registerPolicy } from "../../core/authz";

// State-based rule layered on top of permission grants: dormant (inactive)
// donor records are read-only for everyone, regardless of role.
registerPolicy({
  module: "donor-management",
  action: ACTIONS.EDIT,
  name: "active-records-only",
  check: ({ resource }) => !resource || resource.active !== false
});
