import { Navigate, Route, Routes } from "react-router-dom";
import { ACTIONS, RequireAuth, RequireModuleAccess, useCan } from "../../core/authz";
import { getModules } from "../../core/registry";
import { AppShell } from "../layout/AppShell";
import { AuthLayout } from "../pages/auth/AuthLayout";
import { PendingApprovalPage } from "../pages/auth/PendingApprovalPage";
import { SignInPage } from "../pages/auth/SignInPage";
import { SignUpPage } from "../pages/auth/SignUpPage";
import { ForbiddenPage, NotFoundPage } from "../pages/StatusPage";

// Lands the user on the first module their permissions allow.
function HomeRedirect() {
  const canDo = useCan();
  const firstAccessible = getModules().find((module) => canDo(ACTIONS.VIEW, module.id));
  return <Navigate to={firstAccessible?.path ?? "/forbidden"} replace />;
}

// All private routes are generated from the module registry — the router has
// no knowledge of individual modules.
export function AppRouter() {
  const modules = getModules();

  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/register" element={<SignUpPage />} />
        <Route path="/pending-approval" element={<PendingApprovalPage />} />
      </Route>

      <Route element={<RequireAuth />}>
        <Route element={<AppShell />}>
          <Route index element={<HomeRedirect />} />

          {modules.map((module) => (
            <Route
              key={module.id}
              path={module.path}
              element={<RequireModuleAccess moduleId={module.id} />}
            >
              {module.routes.map((route, routeIndex) =>
                route.index ? (
                  <Route key={routeIndex} index element={<route.Component />} />
                ) : (
                  <Route key={routeIndex} path={route.path} element={<route.Component />} />
                )
              )}
            </Route>
          ))}

          <Route path="/forbidden" element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
