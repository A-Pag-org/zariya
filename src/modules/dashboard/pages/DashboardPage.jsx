import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Card, CardActionArea, CardContent, Chip, Grid, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../core/auth";
import { ACTIONS, getRole, useCan } from "../../../core/authz";
import { getModules } from "../../../core/registry";
import { PageHeader } from "../../../shared/components";

const ACTION_LABELS = [
  [ACTIONS.VIEW, "View"],
  [ACTIONS.EDIT, "Edit"],
  [ACTIONS.COMMENT, "Comment"]
];

// The dashboard renders the user's actual workspace: every registered module
// they can open, with the actions their permissions allow.
export default function DashboardPage() {
  const { user } = useAuth();
  const canDo = useCan();
  const navigate = useNavigate();
  const role = getRole(user?.role);

  const workspace = getModules()
    .filter((module) => module.id !== "dashboard" && canDo(ACTIONS.VIEW, module.id))
    .map((module) => ({
      module,
      actions: ACTION_LABELS.filter(([action]) => canDo(action, module.id)).map(([, label]) => label)
    }));

  const firstName = (user?.name ?? "").split(" ")[0];

  return (
    <>
      <PageHeader
        eyebrow="Overview"
        title={`Welcome, ${firstName}`}
        subtitle={
          role
            ? `You are signed in as ${role.label} — ${role.description.charAt(0).toLowerCase()}${role.description.slice(1)}`
            : "Your workspace is ready."
        }
      />

      <Typography variant="overline" component="h2" sx={{ display: "block", mb: 1.5 }}>
        Your workspace
      </Typography>

      <Grid container spacing={2.5}>
        {workspace.map(({ module, actions }) => (
          <Grid key={module.id} size={{ xs: 12, sm: 6, lg: 4 }}>
            <Card sx={{ height: "100%" }}>
              <CardActionArea onClick={() => navigate(module.path)} sx={{ height: "100%" }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
                    <module.icon sx={{ color: "secondary.main" }} />
                    <ArrowForwardRoundedIcon sx={{ fontSize: 18, color: "text.secondary" }} />
                  </Stack>
                  <Typography variant="h5" sx={{ mt: 2 }}>
                    {module.title}
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                    {actions.map((label) => (
                      <Chip key={label} label={label} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
