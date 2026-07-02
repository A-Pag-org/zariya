import GridViewOutlinedIcon from "@mui/icons-material/GridViewOutlined";
import { lazy } from "react";

export const dashboardModule = {
  id: "dashboard",
  title: "Dashboard",
  icon: GridViewOutlinedIcon,
  group: "Overview",
  path: "/dashboard",
  order: 10,
  routes: [{ index: true, Component: lazy(() => import("./pages/DashboardPage.jsx")) }]
};
