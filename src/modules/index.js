import AccountBalanceOutlinedIcon from "@mui/icons-material/AccountBalanceOutlined";
import AdminPanelSettingsOutlinedIcon from "@mui/icons-material/AdminPanelSettingsOutlined";
import AssessmentOutlinedIcon from "@mui/icons-material/AssessmentOutlined";
import AutoGraphOutlinedIcon from "@mui/icons-material/AutoGraphOutlined";
import HandshakeOutlinedIcon from "@mui/icons-material/HandshakeOutlined";
import InboxOutlinedIcon from "@mui/icons-material/InboxOutlined";
import QueryStatsOutlinedIcon from "@mui/icons-material/QueryStatsOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import TrendingUpOutlinedIcon from "@mui/icons-material/TrendingUpOutlined";
import { registerModule } from "../core/registry";
import { dashboardModule } from "./dashboard";
import { donorManagementModule } from "./donor-management";
import { createStubModule } from "./stubModule";

// The single integration point for modules: register a manifest here and the
// platform derives navigation, routes and permission scopes from it.
//
// The module map mirrors the Zariya scope document ("Budgeting, Trading &
// Reporting Tool"): the four core financial layers, the trading/control
// features, and the insight + governance modules. Donor Management is the
// first fully built module; the rest are registered scaffolds awaiting their
// build-out.
const modules = [
  dashboardModule,

  // 2. The four core layers
  createStubModule({
    id: "budget",
    title: "Budget",
    icon: AccountBalanceOutlinedIcon,
    group: "Core Layers",
    order: 20,
    description:
      "The control layer — versioned, board-approved plans with cost-centre ownership, CapEx/OpEx classification and approval workflow."
  }),
  createStubModule({
    id: "forecast",
    title: "Forecast",
    icon: TrendingUpOutlinedIcon,
    group: "Core Layers",
    order: 21,
    description:
      "The intelligence layer — rolling 12-month projections with locked prior periods, confidence bands and named line owners."
  }),
  createStubModule({
    id: "actuals",
    title: "Actuals",
    icon: ReceiptLongOutlinedIcon,
    group: "Core Layers",
    order: 22,
    description:
      "The truth layer — immutable accounting transactions with cut-off enforcement and a dual-authorisation reclassification workflow."
  }),
  createStubModule({
    id: "variance",
    title: "Variance",
    icon: QueryStatsOutlinedIcon,
    group: "Core Layers",
    order: 23,
    description:
      "The analysis layer — BvA, BvF and FvA with materiality thresholds, favourable/adverse tagging and mandatory root-cause commentary."
  }),

  // 5–6. Trading & control features
  createStubModule({
    id: "trading",
    title: "Committed (Trading)",
    icon: HandshakeOutlinedIcon,
    group: "Control",
    order: 30,
    description:
      "Purchase orders, contracts and grant pipelines tracked between approval and accounting entry — feeding Available Budget = Budget − Actuals − Committed."
  }),
  createStubModule({
    id: "unassigned-funding",
    title: "Unassigned Funding",
    icon: InboxOutlinedIcon,
    group: "Control",
    order: 31,
    description:
      "Holding bucket for actuals not yet mapped to a funding source, with ageing counters and 30-day escalation."
  }),
  donorManagementModule,

  // 6.2 + 7. Insight
  createStubModule({
    id: "optimiser",
    title: "Optimiser",
    icon: AutoGraphOutlinedIcon,
    group: "Insight",
    order: 40,
    description:
      "Scenario modelling — reallocations, deferrals and timing shifts — with the selected scenario pushed back into the live forecast."
  }),
  createStubModule({
    id: "reporting",
    title: "Reporting",
    icon: AssessmentOutlinedIcon,
    group: "Insight",
    order: 41,
    description:
      "Board packs, management accounts, donor reports, fundraising pipeline and audit support — exportable to PDF, Excel and CSV."
  }),

  // 6.3 Access control & governance
  createStubModule({
    id: "governance",
    title: "Access & Governance",
    icon: AdminPanelSettingsOutlinedIcon,
    group: "Platform",
    order: 50,
    description:
      "Role-based access, separation of duties, and the full who-did-what-and-when change log."
  })
];

modules.forEach(registerModule);
