import { Box, Link, Typography } from "@mui/material";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../../core/auth";

export function AuthLayout() {
  const { user, isRestoring } = useAuth();

  if (isRestoring) return null;
  if (user) return <Navigate to="/" replace />;

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        bgcolor: "background.default",
        px: 2,
        py: { xs: 4, md: 8 }
      }}
    >
      <Box sx={{ textAlign: "center", mb: 5 }}>
        <Typography variant="h3" component="h1" sx={{ letterSpacing: "0.02em" }}>
          Zariya
        </Typography>
        <Typography
          variant="overline"
          component="p"
          sx={{ mt: 0.5, color: "secondary.main" }}
        >
          Budgeting · Trading · Reporting
        </Typography>
      </Box>

      <Outlet />

      <Typography variant="caption" color="text.secondary" sx={{ mt: "auto", pt: 6 }}>
        © {new Date().getFullYear()}{" "}
        <Link
          href="https://www.theconvergencefoundation.org"
          target="_blank"
          rel="noreferrer"
          color="inherit"
        >
          The Convergence Foundation
        </Link>{" "}
        · Authorized personnel only
      </Typography>
    </Box>
  );
}
