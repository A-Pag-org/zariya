import VolunteerActivismOutlinedIcon from "@mui/icons-material/VolunteerActivismOutlined";
import { lazy } from "react";
import "./policies";

export const donorManagementModule = {
  id: "donor-management",
  title: "Donor Management",
  icon: VolunteerActivismOutlinedIcon,
  group: "Control",
  path: "/donor-management",
  order: 32,
  routes: [
    { index: true, Component: lazy(() => import("./pages/DonorManagementPage.jsx")) }
  ]
};
