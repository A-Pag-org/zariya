import {
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography
} from "@mui/material";
import { NavLink } from "react-router-dom";
import { ACTIONS, useCan } from "../../core/authz";
import { getNavigationGroups } from "../../core/registry";

export const SIDENAV_WIDTH = 264;

// Navigation is derived, never hand-maintained: registry modules filtered by
// the signed-in user's `view` permission. A user who cannot open a module
// never sees its entry.
export function SideNav() {
  const canDo = useCan();
  const groups = getNavigationGroups((module) => canDo(ACTIONS.VIEW, module.id));

  return (
    <Box
      component="nav"
      aria-label="Primary"
      sx={{
        width: SIDENAV_WIDTH,
        flexShrink: 0,
        borderRight: 1,
        borderColor: "divider",
        bgcolor: "background.default",
        display: "flex",
        flexDirection: "column",
        px: 2,
        py: 3
      }}
    >
      <Box sx={{ px: 1.5, pb: 3, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h5" component="p" sx={{ letterSpacing: "0.02em" }}>
          Zariya
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: "0.08em" }}>
          A CONVERGENCE FOUNDATION PRODUCT
        </Typography>
      </Box>

      {groups.map((group) => (
        <Box key={group.label} sx={{ mt: 3 }}>
          <Typography variant="overline" sx={{ px: 1.5 }}>
            {group.label}
          </Typography>
          <List dense disablePadding sx={{ mt: 0.5 }}>
            {group.items.map((module) => (
              <ListItemButton
                key={module.id}
                component={NavLink}
                to={module.path}
                sx={{
                  borderRadius: 2,
                  mb: 0.25,
                  px: 1.5,
                  py: 0.9,
                  color: "text.secondary",
                  "&:hover": { bgcolor: "action.hover" },
                  "&.active": {
                    color: "text.primary",
                    bgcolor: "#ECE9E2",
                    "& .MuiListItemIcon-root": { color: "secondary.main" }
                  }
                }}
              >
                {module.icon ? (
                  <ListItemIcon sx={{ minWidth: 34, color: "inherit" }}>
                    <module.icon sx={{ fontSize: 19 }} />
                  </ListItemIcon>
                ) : null}
                <ListItemText
                  primary={module.title}
                  slotProps={{ primary: { fontSize: 14, fontWeight: 500 } }}
                />
              </ListItemButton>
            ))}
          </List>
        </Box>
      ))}
    </Box>
  );
}
