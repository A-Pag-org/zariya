import { Box, LinearProgress } from "@mui/material";
import { Suspense } from "react";
import { Outlet } from "react-router-dom";
import { SideNav } from "./SideNav";
import { TopBar } from "./TopBar";

export function AppShell() {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <SideNav />
      <Box sx={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
        <TopBar />
        <Box component="main" sx={{ flex: 1, px: 4, py: 4 }}>
          <Suspense fallback={<LinearProgress color="secondary" sx={{ maxWidth: 360, mx: "auto", mt: 8 }} />}>
            <Outlet />
          </Suspense>
        </Box>
      </Box>
    </Box>
  );
}
