import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Box,
  Button,
  Chip,
  Divider,
  Drawer,
  IconButton,
  Link,
  Stack,
  Typography
} from "@mui/material";
import { useState } from "react";
import { ACTIONS, Can } from "../../../core/authz";
import { detailFieldSchema } from "../api/donorRepository";
import { formatDateTime } from "../lib/formatters";
import { DonorComments } from "./DonorComments";
import { DonorEditDialog } from "./DonorEditDialog";

function FieldValue({ donor, field }) {
  const value = donor?.[field.key];

  if (field.type === "boolean") return value ? "Yes" : "No";
  if (field.type === "datetime") return formatDateTime(value);
  if (field.type === "email" && value && value !== "-") {
    return (
      <Link href={`mailto:${value}`} color="text.primary">
        {value}
      </Link>
    );
  }
  if (field.type === "link" && value) {
    return (
      <Link href={value} target="_blank" rel="noreferrer" color="text.primary">
        Open MoU
      </Link>
    );
  }
  return value || "-";
}

export function DonorDetailDrawer({ donor, open, onClose }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{ paper: { sx: { width: { xs: "100%", sm: 500 } } } }}
    >
      {donor ? (
        <>
          <Box sx={{ px: 3, py: 2.5, borderBottom: 1, borderColor: "divider" }}>
            <Stack direction="row" sx={{ alignItems: "flex-start", justifyContent: "space-between" }}>
              <Box>
                <Typography variant="overline" color="secondary.main">
                  Donor profile
                </Typography>
                <Typography variant="h5" component="h2">
                  {donor.donorName}
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  <Chip size="small" variant="outlined" label={donor.donorCode} />
                  {!donor.active ? <Chip size="small" label="Dormant" /> : null}
                </Stack>
              </Box>
              <IconButton onClick={onClose} aria-label="Close panel" size="small">
                <CloseRoundedIcon />
              </IconButton>
            </Stack>

            <Can action={ACTIONS.EDIT} module="donor-management" resource={donor}>
              <Button
                variant="outlined"
                color="inherit"
                size="small"
                startIcon={<EditOutlinedIcon sx={{ fontSize: 16 }} />}
                sx={{ mt: 2 }}
                onClick={() => setIsEditing(true)}
              >
                Edit donor
              </Button>
            </Can>
          </Box>

          <Box sx={{ px: 3, py: 2.5, overflowY: "auto" }}>
            <Box component="dl" sx={{ m: 0, display: "grid", rowGap: 1.75 }}>
              {detailFieldSchema.map((field) => (
                <Box key={field.key} sx={{ display: "grid", gridTemplateColumns: "180px 1fr", columnGap: 2 }}>
                  <Typography component="dt" variant="caption" color="text.secondary" sx={{ pt: 0.25 }}>
                    {field.label}
                  </Typography>
                  <Typography component="dd" variant="body2" sx={{ m: 0, fontWeight: 500, wordBreak: "break-word" }}>
                    <FieldValue donor={donor} field={field} />
                  </Typography>
                </Box>
              ))}
            </Box>

            <Divider sx={{ my: 3 }} />

            <DonorComments donorId={donor.donorId} />
          </Box>

          <DonorEditDialog donor={donor} open={isEditing} onClose={() => setIsEditing(false)} />
        </>
      ) : null}
    </Drawer>
  );
}
