import {
  Box,
  Card,
  Chip,
  LinearProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from "@mui/material";
import { formatLakhs } from "../lib/formatters";

function AllocationCell({ donor }) {
  const ratio = donor.committedLakhs
    ? Math.max(0, Math.min(100, (donor.receivedLakhs / donor.committedLakhs) * 100))
    : 0;
  const healthy = ratio >= 80;

  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
      <LinearProgress
        variant="determinate"
        value={ratio}
        sx={{
          width: 110,
          height: 5,
          borderRadius: 3,
          bgcolor: "divider",
          "& .MuiLinearProgress-bar": {
            borderRadius: 3,
            bgcolor: healthy ? "success.main" : "secondary.main"
          }
        }}
      />
      <Typography variant="caption" fontWeight={600} color={healthy ? "success.main" : "secondary.main"}>
        {ratio.toFixed(0)}%
      </Typography>
    </Stack>
  );
}

function DomicileChip({ donor }) {
  return donor.fcraApplicable ? (
    <Chip size="small" label="Foreign · FCRA" sx={{ bgcolor: "primary.main", color: "primary.contrastText" }} />
  ) : (
    <Chip size="small" label="Domestic" variant="outlined" />
  );
}

export function DonorTable({ donors, isLoading, selectedId, onSelect }) {
  return (
    <Card>
      <Box sx={{ px: 3, py: 2.5, borderBottom: 1, borderColor: "divider" }}>
        <Typography variant="h6">Donor register</Typography>
        <Typography variant="caption" color="text.secondary">
          Select a donor to open the full profile.
        </Typography>
      </Box>

      {isLoading ? <LinearProgress color="secondary" /> : null}

      <TableContainer>
        <Table sx={{ minWidth: 860 }}>
          <TableHead>
            <TableRow>
              <TableCell>Donor</TableCell>
              <TableCell>Domicile</TableCell>
              <TableCell>Fund type</TableCell>
              <TableCell align="right">Committed</TableCell>
              <TableCell align="right">Received</TableCell>
              <TableCell>Allocation</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!isLoading && donors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 6, color: "text.secondary" }}>
                  No donors matched the current search.
                </TableCell>
              </TableRow>
            ) : (
              donors.map((donor) => (
                <TableRow
                  key={donor.donorId}
                  hover
                  selected={selectedId === donor.donorId}
                  onClick={() => onSelect(donor)}
                  sx={{ cursor: "pointer", opacity: donor.active ? 1 : 0.55 }}
                >
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {donor.donorName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {donor.donorCode}
                      {donor.active ? "" : " · Dormant"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <DomicileChip donor={donor} />
                  </TableCell>
                  <TableCell>
                    <Chip size="small" variant="outlined" label={donor.fundType} />
                  </TableCell>
                  <TableCell align="right">{formatLakhs(donor.committedLakhs)}</TableCell>
                  <TableCell align="right">{formatLakhs(donor.receivedLakhs)}</TableCell>
                  <TableCell>
                    <AllocationCell donor={donor} />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}
