import AddRoundedIcon from "@mui/icons-material/AddRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import { Button, Grid, InputAdornment, Stack, TextField } from "@mui/material";
import { useMemo, useState } from "react";
import { ACTIONS, Can } from "../../../core/authz";
import { PageHeader, StatCard } from "../../../shared/components";
import { DonorDetailDrawer } from "../components/DonorDetailDrawer";
import { DonorFormDialog } from "../components/DonorFormDialog";
import { DonorTable } from "../components/DonorTable";
import { useDonorsQuery } from "../hooks/useDonors";
import { formatCompactCroreFromLakhs } from "../lib/formatters";

export default function DonorManagementPage() {
  const { data: donors = [], isLoading } = useDonorsQuery();
  const [search, setSearch] = useState("");
  const [selectedDonorId, setSelectedDonorId] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const filteredDonors = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return donors;
    return donors.filter((donor) =>
      [donor.donorName, donor.donorCode, donor.donorSource, donor.contactPerson]
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [donors, search]);

  const summary = useMemo(() => {
    const committed = donors.reduce((sum, donor) => sum + donor.committedLakhs, 0);
    const received = donors.reduce((sum, donor) => sum + donor.receivedLakhs, 0);
    return {
      donors: donors.length,
      committed,
      received,
      gap: Math.max(committed - received, 0)
    };
  }, [donors]);

  const selectedDonor = donors.find((donor) => donor.donorId === selectedDonorId) ?? null;

  return (
    <>
      <PageHeader
        eyebrow="Control"
        title="Donor agreements & mapping"
        subtitle="Funding sources mapped to budget lines — 100% mapping integrity required."
        actions={
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
            <TextField
              size="small"
              placeholder="Search name, code, source…"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              sx={{ width: { xs: "100%", sm: 300 } }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ fontSize: 18 }} />
                    </InputAdornment>
                  )
                }
              }}
            />
            <Can action={ACTIONS.EDIT} module="donor-management">
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon sx={{ fontSize: 18 }} />}
                onClick={() => setIsAdding(true)}
              >
                Add donor
              </Button>
            </Can>
          </Stack>
        }
      />

      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Donors" value={summary.donors} hint="Active and dormant engagements" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Total committed" value={formatCompactCroreFromLakhs(summary.committed)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Received YTD" value={formatCompactCroreFromLakhs(summary.received)} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard label="Pipeline gap" value={formatCompactCroreFromLakhs(summary.gap)} emphasis />
        </Grid>
      </Grid>

      <DonorTable
        donors={filteredDonors}
        isLoading={isLoading}
        selectedId={selectedDonorId}
        onSelect={(donor) => setSelectedDonorId(donor.donorId)}
      />

      <DonorDetailDrawer
        donor={selectedDonor}
        open={Boolean(selectedDonor)}
        onClose={() => setSelectedDonorId(null)}
      />

      <DonorFormDialog donor={null} open={isAdding} onClose={() => setIsAdding(false)} />
    </>
  );
}
