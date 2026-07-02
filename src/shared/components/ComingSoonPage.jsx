import { Box, Typography } from "@mui/material";

// Placeholder page used by scaffolded modules that are registered in the
// platform (navigation, routing, permissions) but not yet built out.
export function ComingSoonPage({ title, description }) {
  return (
    <Box sx={{ maxWidth: 520, mx: "auto", mt: 12, textAlign: "center" }}>
      <Typography variant="overline" color="secondary.main">
        In development
      </Typography>
      <Typography variant="h3" sx={{ mt: 1 }}>
        {title}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        {description ??
          "This module is registered on the platform and will appear here once its first release ships."}
      </Typography>
    </Box>
  );
}
