import { zodResolver } from "@hookform/resolvers/zod";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  Link,
  Stack,
  TextField,
  Typography
} from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { DEMO_PASSWORD, useAuth } from "../../../core/auth";
import { ROLE_LIST } from "../../../core/authz";
import { signInSchema } from "./authSchemas";

const DEMO_ACCOUNTS = [
  { email: "ceo@theconvergencefoundation.org", role: ROLE_LIST[0].label },
  { email: "finance@theconvergencefoundation.org", role: ROLE_LIST[1].label },
  { email: "fundraising@theconvergencefoundation.org", role: ROLE_LIST[2].label }
];

export function SignInPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "", rememberMe: false }
  });

  async function onSubmit(values) {
    setServerError(null);
    try {
      await signIn(values);
      navigate(location.state?.from ?? "/", { replace: true });
    } catch (error) {
      setServerError(error.message);
    }
  }

  return (
    <Card sx={{ width: "100%", maxWidth: 420 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h4" component="h2">
          Sign in
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
          Enter your credentials to continue.
        </Typography>

        <Box component="form" noValidate onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={2.5}>
            <TextField
              label="Email address"
              type="email"
              autoComplete="email"
              fullWidth
              error={Boolean(errors.email)}
              helperText={errors.email?.message}
              {...register("email")}
            />
            <TextField
              label="Password"
              type="password"
              autoComplete="current-password"
              fullWidth
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              {...register("password")}
            />

            {serverError ? <Alert severity="error">{serverError}</Alert> : null}

            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              {isSubmitting ? "Signing in…" : "Sign in"}
            </Button>
          </Stack>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, textAlign: "center" }}>
          New to Zariya?{" "}
          <Link component={RouterLink} to="/register" color="text.primary" fontWeight={600}>
            Request an account
          </Link>
        </Typography>

        <Divider sx={{ my: 3 }}>
          <Typography variant="overline">Demo access</Typography>
        </Divider>

        <Stack spacing={0.75}>
          {DEMO_ACCOUNTS.map((account) => (
            <Stack
              key={account.email}
              direction="row"
              sx={{ justifyContent: "space-between", alignItems: "center" }}
            >
              <Link
                component="button"
                type="button"
                variant="body2"
                color="text.primary"
                underline="hover"
                onClick={() => {
                  setValue("email", account.email);
                  setValue("password", DEMO_PASSWORD);
                }}
              >
                {account.email}
              </Link>
              <Typography variant="caption" color="text.secondary">
                {account.role}
              </Typography>
            </Stack>
          ))}
          <Typography variant="caption" color="text.secondary" sx={{ pt: 0.5 }}>
            Password for all demo accounts: <code>{DEMO_PASSWORD}</code>
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
