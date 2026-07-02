import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AuthContext } from "../../auth/AuthProvider";
import { ACTIONS } from "../actions";
import { Can } from "../Can";
import { ROLES } from "../roles";

function renderWithUser(user, ui) {
  return render(
    <AuthContext.Provider value={{ user, isRestoring: false }}>{ui}</AuthContext.Provider>
  );
}

describe("<Can />", () => {
  it("renders children when the user has the permission", () => {
    renderWithUser(
      { id: "u1", role: ROLES.FINANCE_OFFICER.id, status: "active" },
      <Can action={ACTIONS.EDIT} module="donor-management">
        <button>Edit donor</button>
      </Can>
    );
    expect(screen.getByRole("button", { name: "Edit donor" })).toBeInTheDocument();
  });

  it("renders the fallback when the permission is missing", () => {
    renderWithUser(
      { id: "u1", role: ROLES.CEO.id, status: "active" },
      <Can action={ACTIONS.EDIT} module="donor-management" fallback={<span>Read only</span>}>
        <button>Edit donor</button>
      </Can>
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.getByText("Read only")).toBeInTheDocument();
  });
});
