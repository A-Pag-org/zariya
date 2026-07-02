import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  Switch,
  TextField
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useUpdateDonorMutation } from "../hooks/useDonors";

const donorEditSchema = z.object({
  donorName: z.string().trim().min(2, "Donor name is required."),
  contactPerson: z.string().trim().min(2, "Contact person is required."),
  email: z.string().trim().email("Enter a valid email address."),
  phone: z.string().trim().min(6, "Enter a valid phone number."),
  committedLakhs: z.coerce.number().min(0, "Must be zero or more."),
  receivedLakhs: z.coerce.number().min(0, "Must be zero or more."),
  active: z.boolean()
});

export function DonorEditDialog({ donor, open, onClose }) {
  const updateDonor = useUpdateDonorMutation();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(donorEditSchema),
    values: donor
      ? {
          donorName: donor.donorName,
          contactPerson: donor.contactPerson,
          email: donor.email,
          phone: donor.phone,
          committedLakhs: donor.committedLakhs,
          receivedLakhs: donor.receivedLakhs,
          active: donor.active
        }
      : undefined
  });

  async function onSubmit(values) {
    await updateDonor.mutateAsync({ donorId: donor.donorId, patch: values });
    onClose();
  }

  const fieldProps = (name) => ({
    error: Boolean(errors[name]),
    helperText: errors[name]?.message,
    fullWidth: true,
    ...register(name)
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontFamily: (theme) => theme.typography.h5.fontFamily }}>
        Edit donor · {donor?.donorCode}
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2.5} sx={{ pt: 0.5 }} component="form" id="donor-edit-form" onSubmit={handleSubmit(onSubmit)}>
          <Grid size={12}>
            <TextField label="Donor name" {...fieldProps("donorName")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Contact person" {...fieldProps("contactPerson")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Phone" {...fieldProps("phone")} />
          </Grid>
          <Grid size={12}>
            <TextField label="Email" type="email" {...fieldProps("email")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Committed (₹ lakhs)" type="number" {...fieldProps("committedLakhs")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Received (₹ lakhs)" type="number" {...fieldProps("receivedLakhs")} />
          </Grid>
          <Grid size={12}>
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={Boolean(field.value)} onChange={field.onChange} />}
                  label="Active engagement"
                />
              )}
            />
          </Grid>
          {updateDonor.isError ? (
            <Grid size={12}>
              <Alert severity="error">{updateDonor.error.message}</Alert>
            </Grid>
          ) : null}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button type="submit" form="donor-edit-form" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
