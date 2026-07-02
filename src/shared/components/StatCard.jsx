import { Card, CardContent, Typography } from "@mui/material";

export function StatCard({ label, value, hint, emphasis = false }) {
  return (
    <Card
      sx={
        emphasis
          ? { bgcolor: "primary.main", color: "primary.contrastText", borderColor: "primary.main" }
          : undefined
      }
    >
      <CardContent sx={{ p: 3 }}>
        <Typography
          variant="overline"
          component="p"
          sx={{ color: emphasis ? "rgba(252,251,248,0.7)" : "text.secondary" }}
        >
          {label}
        </Typography>
        <Typography variant="h3" component="p" sx={{ mt: 0.5, color: "inherit" }}>
          {value}
        </Typography>
        {hint ? (
          <Typography
            variant="caption"
            sx={{ color: emphasis ? "rgba(252,251,248,0.7)" : "text.secondary" }}
          >
            {hint}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
}
