import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import TuneOutlinedIcon from "@mui/icons-material/TuneOutlined";
import { registerModule } from "../core/registry";
import { dashboardModule } from "./dashboard";
import { donorManagementModule } from "./donor-management";
import { createStubModule } from "./stubModule";

// The single integration point for modules: register a manifest here and the
// platform derives navigation, routes and permission scopes from it. Nothing
// else changes when a module is added or removed.
const modules = [
  dashboardModule,
  donorManagementModule,
  createStubModule({
    id: "reporting",
    title: "Reporting",
    icon: AssessmentOutlinedIcon,
    group: "Insight",
    order: 30
  }),
  createStubModule({
    id: "users",
    title: "Users",
    icon: GroupOutlinedIcon,
    group: "Platform",
    order: 40
  }),
  createStubModule({
    id: "administration",
    title: "Administration",
    icon: TuneOutlinedIcon,
    group: "Platform",
    order: 50
  })
];

modules.forEach(registerModule);
