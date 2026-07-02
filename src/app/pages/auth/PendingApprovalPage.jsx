import MarkEmailReadOutlinedIcon from "@mui/icons-material/MarkEmailReadOutlined";
import { Button, Card, CardContent, Typography } from "@mui/material";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { APPROVAL_AUTHORITY } from "../../../core/auth";

export function PendingApprovalPage() {
  const location = useLocation();
  const email = location.state?.email;

  return (
    <Card sx={{ width: "100%", maxWidth: 480 }}>
      <CardContent sx={{ p: 5, textAlign: "center" }}>
        <MarkEmailReadOutlinedIcon sx={{ fontSize: 40, color: "secondary.main" }} />
        <Typography variant="h4" component="h2" sx={{ mt: 2 }}>
          Awaiting approval
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 2 }}>
          {email ? (
            <>
              Your request for <strong>{email}</strong> has been submitted.
            </>
          ) : (
            "Your registration has been submitted."
          )}{" "}
          An administrator at <strong>{APPROVAL_AUTHORITY}</strong> must approve your account
          before you can sign in. Your role-based permissions are activated on approval.
        </Typography>
        <Button component={RouterLink} to="/sign-in" variant="outlined" color="inherit" sx={{ mt: 4 }}>
          Back to sign in
        </Button>
      </CardContent>
    </Card>
  );
}
