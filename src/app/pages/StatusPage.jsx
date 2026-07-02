import { Box, Button, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

// Shared full-page status layout for 403 / 404 and similar terminal states.
export function StatusPage({ code, title, message, action }) {
  return (
    <Box sx={{ maxWidth: 480, mx: "auto", mt: 12, textAlign: "center" }}>
      <Typography variant="overline" color="secondary.main">
        {code}
      </Typography>
      <Typography variant="h3" sx={{ mt: 1 }}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2, mb: 4 }}>
        {message}
      </Typography>
      {action ?? (
        <Button component={RouterLink} to="/" variant="outlined" color="inherit">
          Back to home
        </Button>
      )}
    </Box>
  );
}

export function NotFoundPage() {
  return (
    <StatusPage
      code="404"
      title="Page not found"
      message="The page you are looking for doesn't exist or may have been moved."
    />
  );
}

export function ForbiddenPage() {
  return (
    <StatusPage
      code="403"
      title="Access restricted"
      message="Your role does not include access to this module. Contact your administrator if you believe this is an error."
    />
  );
}
