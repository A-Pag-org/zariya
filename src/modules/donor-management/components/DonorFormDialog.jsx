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
  MenuItem,
  Switch,
  TextField,
  Typography
} from "@mui/material";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import { useCreateDonorMutation, useUpdateDonorMutation } from "../hooks/useDonors";
import { formatDateTime } from "../lib/formatters";

const DONOR_TYPES = ["Institutional", "Individual", "Retail Cluster", "Corporate", "Government", "Other"];
const DOMICILES = ["Domestic", "Foreign"];
const FUND_TYPES = ["Restricted", "Unrestricted"];

// Full donor attribute set (scope doc §4.2): identity, funding & compliance,
// contact and record fields. donorId / createdAt / updatedAt are
// system-managed and shown read-only.
const donorSchema = z
  .object({
    donorCode: z.string().trim().min(2, "Donor code is required."),
    donorName: z.string().trim().min(2, "Donor name is required."),
    donorSource: z.string().trim().min(2, "Donor source is required."),
    donorType: z.string().refine((value) => DONOR_TYPES.includes(value), "Select a donor type."),
    fundSourceDomicile: z
      .string()
      .refine((value) => DOMICILES.includes(value), "Select the fund source domicile."),
    fcraApplicable: z.boolean(),
    foreignFundSourceType: z.string().trim(),
    foreignCountryName: z.string().trim(),
    fundType: z.string().refine((value) => FUND_TYPES.includes(value), "Select the fund type."),
    committedLakhs: z.coerce.number().min(0, "Must be zero or more."),
    receivedLakhs: z.coerce.number().min(0, "Must be zero or more."),
    contactPerson: z.string().trim().min(2, "Contact person is required."),
    email: z.string().trim().email("Enter a valid email address."),
    phone: z.string().trim().min(6, "Enter a valid phone number."),
    address: z.string().trim().min(5, "Address is required."),
    panCardNumber: z.string().trim(),
    bankAccountRef: z.string().trim().min(2, "Bank account reference is required."),
    active: z.boolean(),
    mouLink: z
      .string()
      .trim()
      .refine(
        (value) => !value || value === "-" || /^https?:\/\//i.test(value),
        "Enter a valid link starting with http(s)://"
      )
  })
  .superRefine((values, ctx) => {
    if (values.fundSourceDomicile === "Foreign") {
      if (!values.foreignFundSourceType || values.foreignFundSourceType === "-") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["foreignFundSourceType"],
          message: "Required for foreign fund sources."
        });
      }
      if (!values.foreignCountryName || values.foreignCountryName === "-") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["foreignCountryName"],
          message: "Required for foreign fund sources."
        });
      }
    }
  });

const EMPTY_VALUES = {
  donorCode: "",
  donorName: "",
  donorSource: "",
  donorType: "Institutional",
  fundSourceDomicile: "Domestic",
  fcraApplicable: false,
  foreignFundSourceType: "-",
  foreignCountryName: "-",
  fundType: "Restricted",
  committedLakhs: 0,
  receivedLakhs: 0,
  contactPerson: "",
  email: "",
  phone: "",
  address: "",
  panCardNumber: "",
  bankAccountRef: "",
  active: true,
  mouLink: ""
};

function donorToValues(donor) {
  if (!donor) return EMPTY_VALUES;
  const values = {};
  for (const key of Object.keys(EMPTY_VALUES)) {
    values[key] = donor[key] ?? EMPTY_VALUES[key];
  }
  return values;
}

function SectionLabel({ children }) {
  return (
    <Grid size={12}>
      <Typography variant="overline" color="secondary.main">
        {children}
      </Typography>
    </Grid>
  );
}

export function DonorFormDialog({ donor, open, onClose }) {
  const isEdit = Boolean(donor);
  const createDonor = useCreateDonorMutation();
  const updateDonor = useUpdateDonorMutation();
  const mutation = isEdit ? updateDonor : createDonor;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(donorSchema),
    values: donorToValues(donor)
  });

  const domicile = watch("fundSourceDomicile");
  const isForeign = domicile === "Foreign";

  // Domestic donors carry no foreign-source attributes; normalize on switch.
  useEffect(() => {
    if (!isForeign) {
      setValue("fcraApplicable", false);
      setValue("foreignFundSourceType", "-");
      setValue("foreignCountryName", "-");
    }
  }, [isForeign, setValue]);

  function handleClose() {
    mutation.reset();
    reset(donorToValues(donor));
    onClose();
  }

  async function onSubmit(values) {
    if (isEdit) {
      await updateDonor.mutateAsync({ donorId: donor.donorId, patch: values });
    } else {
      await createDonor.mutateAsync(values);
    }
    handleClose();
  }

  const fieldProps = (name) => ({
    error: Boolean(errors[name]),
    helperText: errors[name]?.message,
    fullWidth: true,
    ...register(name)
  });

  const selectField = (name, label, options, helperText) => (
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <TextField
          select
          label={label}
          fullWidth
          error={Boolean(errors[name])}
          helperText={errors[name]?.message ?? helperText}
          {...field}
        >
          {options.map((option) => (
            <MenuItem key={option} value={option}>
              {option}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontFamily: (theme) => theme.typography.h5.fontFamily }}>
        {isEdit ? `Edit donor · ${donor.donorCode}` : "Add donor"}
      </DialogTitle>
      <DialogContent dividers>
        <Grid
          container
          spacing={2.5}
          sx={{ pt: 0.5 }}
          component="form"
          id="donor-form"
          onSubmit={handleSubmit(onSubmit)}
        >
          <SectionLabel>Identity</SectionLabel>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField
              label="Donor ID"
              value={isEdit ? donor.donorId : "Auto-generated"}
              disabled
              fullWidth
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Donor code" {...fieldProps("donorCode")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            {selectField("donorType", "Donor type", DONOR_TYPES)}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Donor name" {...fieldProps("donorName")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Donor source"
              placeholder="e.g. Corporate Foundation, Individuals"
              {...fieldProps("donorSource")}
            />
          </Grid>

          <SectionLabel>Funding &amp; compliance</SectionLabel>
          <Grid size={{ xs: 12, sm: 4 }}>
            {selectField("fundSourceDomicile", "Fund source (domicile)", DOMICILES)}
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            {selectField("fundType", "Fund type", FUND_TYPES)}
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }} sx={{ display: "flex", alignItems: "center" }}>
            <Controller
              name="fcraApplicable"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={
                    <Switch
                      checked={Boolean(field.value)}
                      onChange={field.onChange}
                      disabled={!isForeign}
                    />
                  }
                  label="FCRA applicable"
                />
              )}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Foreign fund source type"
              disabled={!isForeign}
              placeholder="e.g. Foundation Grant"
              {...fieldProps("foreignFundSourceType")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField
              label="Foreign country name"
              disabled={!isForeign}
              {...fieldProps("foreignCountryName")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Committed (₹ lakhs)" type="number" {...fieldProps("committedLakhs")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Received (₹ lakhs)" type="number" {...fieldProps("receivedLakhs")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <TextField label="Bank account ref *" {...fieldProps("bankAccountRef")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="PAN card number" {...fieldProps("panCardNumber")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="MoU (link)" placeholder="https://…" {...fieldProps("mouLink")} />
          </Grid>

          <SectionLabel>Contact</SectionLabel>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Contact person" {...fieldProps("contactPerson")} />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <TextField label="Phone" {...fieldProps("phone")} />
          </Grid>
          <Grid size={12}>
            <TextField label="Email" type="email" {...fieldProps("email")} />
          </Grid>
          <Grid size={12}>
            <TextField label="Address" multiline minRows={2} {...fieldProps("address")} />
          </Grid>

          <SectionLabel>Record</SectionLabel>
          <Grid size={{ xs: 12, sm: 4 }} sx={{ display: "flex", alignItems: "center" }}>
            <Controller
              name="active"
              control={control}
              render={({ field }) => (
                <FormControlLabel
                  control={<Switch checked={Boolean(field.value)} onChange={field.onChange} />}
                  label="Active"
                />
              )}
            />
          </Grid>
          {isEdit ? (
            <>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label="Created at" value={formatDateTime(donor.createdAt)} disabled fullWidth />
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <TextField label="Updated at" value={formatDateTime(donor.updatedAt)} disabled fullWidth />
              </Grid>
            </>
          ) : (
            <Grid size={{ xs: 12, sm: 8 }} sx={{ display: "flex", alignItems: "center" }}>
              <Typography variant="caption" color="text.secondary">
                Created / updated timestamps are recorded automatically.
              </Typography>
            </Grid>
          )}

          {mutation.isError ? (
            <Grid size={12}>
              <Alert severity="error">{mutation.error.message}</Alert>
            </Grid>
          ) : null}
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} color="inherit">
          Cancel
        </Button>
        <Button type="submit" form="donor-form" variant="contained" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : isEdit ? "Save changes" : "Add donor"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
