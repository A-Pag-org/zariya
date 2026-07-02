import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Link,
  MenuItem,
  TextField,
  Typography
} from "@mui/material";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { APPROVAL_AUTHORITY, useAuth } from "../../../core/auth";
import { ROLE_LIST } from "../../../core/authz";
import { signUpSchema } from "./authSchemas";

export function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      mobile: "",
      role: "",
      password: "",
      confirmPassword: ""
    }
  });

  async function onSubmit(values) {
    setServerError(null);
    try {
      const result = await signUp(values);
      navigate("/pending-approval", { state: { email: result.user.email } });
    } catch (error) {
      setServerError(error.message);
    }
  }

  const fieldProps = (name) => ({
    error: Boolean(errors[name]),
    helperText: errors[name]?.message,
    fullWidth: true,
    ...register(name)
  });

  return (
    <Card sx={{ width: "100%", maxWidth: 640 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h4" component="h2">
          Request an account
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
          New accounts are reviewed and approved by {APPROVAL_AUTHORITY} before activation.
        </Typography>

        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="First name" autoComplete="given-name" {...fieldProps("firstName")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Last name" autoComplete="family-name" {...fieldProps("lastName")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Work email" type="email" autoComplete="email" {...fieldProps("email")} />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField label="Mobile number" autoComplete="tel" {...fieldProps("mobile")} />
            </Grid>
            <Grid size={12}>
              <Controller
                name="role"
                control={control}
                render={({ field }) => (
                  <TextField
                    select
                    label="Requested role"
                    fullWidth
                    error={Boolean(errors.role)}
                    helperText={errors.role?.message ?? "Permissions are activated after approval."}
                    {...field}
                  >
                    {ROLE_LIST.map((role) => (
                      <MenuItem key={role.id} value={role.id}>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {role.label}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {role.description}
                          </Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </TextField>
                )}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Password"
                type="password"
                autoComplete="new-password"
                {...fieldProps("password")}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                {...fieldProps("confirmPassword")}
              />
            </Grid>

            {serverError ? (
              <Grid size={12}>
                <Alert severity="error">{serverError}</Alert>
              </Grid>
            ) : null}

            <Grid size={12}>
              <Button type="submit" variant="contained" size="large" fullWidth disabled={isSubmitting}>
                {isSubmitting ? "Submitting…" : "Submit for approval"}
              </Button>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: "center" }}>
          Already have an account?{" "}
          <Link component={RouterLink} to="/sign-in" color="text.primary" fontWeight={600}>
            Sign in
          </Link>
        </Typography>
      </CardContent>
    </Card>
  );
}
