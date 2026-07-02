import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { Avatar, Box, Button, Stack, Typography } from "@mui/material";
import { useAuth } from "../../core/auth";
import { getRole } from "../../core/authz";

function initialsOf(name) {
  const parts = (name ?? "").trim().split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "ZU";
}

export function TopBar() {
  const { user, signOut } = useAuth();
  const roleLabel = getRole(user?.role)?.label ?? "Member";

  return (
    <Box
      component="header"
      sx={{
        height: 64,
        px: 4,
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        gap: 3,
        borderBottom: 1,
        borderColor: "divider",
        bgcolor: "background.paper"
      }}
    >
      <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
        <Avatar
          sx={{
            width: 34,
            height: 34,
            fontSize: 13,
            fontWeight: 600,
            bgcolor: "primary.main",
            color: "primary.contrastText"
          }}
        >
          {initialsOf(user?.name)}
        </Avatar>
        <Box>
          <Typography variant="body2" fontWeight={600} lineHeight={1.2}>
            {user?.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {roleLabel}
          </Typography>
        </Box>
      </Stack>

      <Button
        variant="outlined"
        size="small"
        color="inherit"
        startIcon={<LogoutRoundedIcon sx={{ fontSize: 16 }} />}
        onClick={signOut}
      >
        Sign out
      </Button>
    </Box>
  );
}
