// Donor repository — the module's only data-access seam.
//
// Components and hooks never know where donor data comes from. Today it is an
// in-memory store with simulated latency; replacing the internals with
// `apiClient.get("/donors")` (+ DTO mapping) changes nothing above this file.

const LATENCY_MS = 250;

const donorStore = [
  {
    donorId: "DNR-1001",
    donorCode: "TATA-RESTRICT-01",
    donorName: "Tata Foundation",
    donorSource: "Corporate Foundation",
    donorType: "Institutional",
    fundSourceDomicile: "Domestic",
    fcraApplicable: false,
    foreignFundSourceType: "-",
    foreignCountryName: "-",
    contactPerson: "Nitin Raina",
    email: "nitin.raina@tatafoundation.org",
    phone: "+91 98990 11223",
    address: "Bombay House, Mumbai, Maharashtra, India",
    panCardNumber: "AAACT1122R",
    bankAccountRef: "TATA-001-INR",
    active: true,
    createdAt: "2025-01-04T09:30:00.000Z",
    updatedAt: "2026-06-20T12:10:00.000Z",
    mouLink: "https://example.org/mou/tata-foundation",
    committedLakhs: 120,
    receivedLakhs: 80,
    fundType: "Restricted"
  },
  {
    donorId: "DNR-1002",
    donorCode: "GATES-FCRA-04",
    donorName: "Gates Foundation",
    donorSource: "Global Foundation",
    donorType: "Institutional",
    fundSourceDomicile: "Foreign",
    fcraApplicable: true,
    foreignFundSourceType: "Foundation Grant",
    foreignCountryName: "United States",
    contactPerson: "Nadia Brooks",
    email: "nadia.brooks@gatesfoundation.org",
    phone: "+1 206 709 3100",
    address: "500 5th Ave N, Seattle, Washington, USA",
    panCardNumber: "-",
    bankAccountRef: "FCRA-233-USD",
    active: true,
    createdAt: "2024-11-10T11:00:00.000Z",
    updatedAt: "2026-05-11T16:43:00.000Z",
    mouLink: "https://example.org/mou/gates-foundation",
    committedLakhs: 95,
    receivedLakhs: 65,
    fundType: "Restricted"
  },
  {
    donorId: "DNR-1003",
    donorCode: "AZIM-UNREST-02",
    donorName: "Azim Premji Philanthropy",
    donorSource: "Indian Philanthropy",
    donorType: "Institutional",
    fundSourceDomicile: "Domestic",
    fcraApplicable: false,
    foreignFundSourceType: "-",
    foreignCountryName: "-",
    contactPerson: "Ritu Sharma",
    email: "ritu.sharma@azimpremjiphilanthropy.in",
    phone: "+91 80444 12000",
    address: "Bengaluru, Karnataka, India",
    panCardNumber: "AACCA7821P",
    bankAccountRef: "AZIM-7821-INR",
    active: true,
    createdAt: "2025-02-18T08:25:00.000Z",
    updatedAt: "2026-06-01T10:01:00.000Z",
    mouLink: "https://example.org/mou/azim-premji",
    committedLakhs: 50,
    receivedLakhs: 50,
    fundType: "Unrestricted"
  },
  {
    donorId: "DNR-1004",
    donorCode: "ROCK-FCRA-09",
    donorName: "Rockefeller Foundation",
    donorSource: "Global Endowment",
    donorType: "Institutional",
    fundSourceDomicile: "Foreign",
    fcraApplicable: true,
    foreignFundSourceType: "Endowment Grant",
    foreignCountryName: "United States",
    contactPerson: "Sam Ellis",
    email: "sam.ellis@rockefeller.org",
    phone: "+1 212 852 8300",
    address: "420 5th Ave, New York, USA",
    panCardNumber: "-",
    bankAccountRef: "FCRA-488-USD",
    active: true,
    createdAt: "2025-03-11T10:15:00.000Z",
    updatedAt: "2026-06-23T06:42:00.000Z",
    mouLink: "https://example.org/mou/rockefeller",
    committedLakhs: 42,
    receivedLakhs: 21,
    fundType: "Restricted"
  },
  {
    donorId: "DNR-1005",
    donorCode: "IND-POOL-07",
    donorName: "Individual Giving Pool",
    donorSource: "Individuals",
    donorType: "Retail Cluster",
    fundSourceDomicile: "Domestic",
    fcraApplicable: false,
    foreignFundSourceType: "-",
    foreignCountryName: "-",
    contactPerson: "Devika Rao",
    email: "devika.rao@zariya.org",
    phone: "+91 99880 77889",
    address: "Bengaluru, Karnataka, India",
    panCardNumber: "AAATS2786D",
    bankAccountRef: "INDIV-POOL-INR",
    active: true,
    createdAt: "2024-08-21T07:15:00.000Z",
    updatedAt: "2026-06-29T15:06:00.000Z",
    mouLink: "https://example.org/mou/individual-pool",
    committedLakhs: 30,
    receivedLakhs: 18.5,
    fundType: "Unrestricted"
  },
  {
    donorId: "DNR-1006",
    donorCode: "BLMBRG-FCRA-11",
    donorName: "Bloomberg Philanthropies",
    donorSource: "Global Foundation",
    donorType: "Institutional",
    fundSourceDomicile: "Foreign",
    fcraApplicable: true,
    foreignFundSourceType: "Program Grant",
    foreignCountryName: "United States",
    contactPerson: "Aisha Rahman",
    email: "aisha.rahman@bloomberg.org",
    phone: "+1 212 205 0100",
    address: "25 East 78th Street, New York, USA",
    panCardNumber: "-",
    bankAccountRef: "FCRA-611-USD",
    active: true,
    createdAt: "2025-04-13T09:00:00.000Z",
    updatedAt: "2026-06-30T05:55:00.000Z",
    mouLink: "https://example.org/mou/bloomberg-philanthropies",
    committedLakhs: 28,
    receivedLakhs: 8,
    fundType: "Restricted"
  },
  {
    donorId: "DNR-1007",
    donorCode: "FORD-DORM-03",
    donorName: "Ford Foundation",
    donorSource: "Global Foundation",
    donorType: "Institutional",
    fundSourceDomicile: "Foreign",
    fcraApplicable: true,
    foreignFundSourceType: "Foundation Grant",
    foreignCountryName: "United States",
    contactPerson: "Elena Vargas",
    email: "elena.vargas@fordfoundation.org",
    phone: "+1 212 573 5000",
    address: "320 E 43rd St, New York, USA",
    panCardNumber: "-",
    bankAccountRef: "FCRA-190-USD",
    active: false,
    createdAt: "2023-06-02T09:00:00.000Z",
    updatedAt: "2025-12-15T11:20:00.000Z",
    mouLink: "https://example.org/mou/ford-foundation",
    committedLakhs: 15,
    receivedLakhs: 15,
    fundType: "Restricted"
  }
];

const commentStore = {
  "DNR-1002": [
    {
      id: "cmt-1",
      author: "Priya Nair",
      body: "Tranche 2 received; utilization certificate shared with the donor on 11 May.",
      createdAt: "2026-05-12T09:05:00.000Z"
    }
  ]
};

function delay(ms = LATENCY_MS) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const detailFieldSchema = [
  { key: "donorId", label: "Donor ID" },
  { key: "donorCode", label: "Donor Code" },
  { key: "donorName", label: "Donor Name" },
  { key: "donorSource", label: "Donor Source" },
  { key: "donorType", label: "Donor Type" },
  { key: "fundSourceDomicile", label: "Fund Source (Domicile)" },
  { key: "fcraApplicable", label: "FCRA Applicable", type: "boolean" },
  { key: "foreignFundSourceType", label: "Foreign Fund Source Type" },
  { key: "foreignCountryName", label: "Foreign Country Name" },
  { key: "contactPerson", label: "Contact Person" },
  { key: "email", label: "Email", type: "email" },
  { key: "phone", label: "Phone" },
  { key: "address", label: "Address" },
  { key: "panCardNumber", label: "PAN Card Number" },
  { key: "bankAccountRef", label: "Bank Account Ref" },
  { key: "active", label: "Active", type: "boolean" },
  { key: "createdAt", label: "Created At", type: "datetime" },
  { key: "updatedAt", label: "Updated At", type: "datetime" },
  { key: "mouLink", label: "MoU (Link)", type: "link" }
];

export const donorRepository = {
  async list() {
    await delay();
    return donorStore.map((donor) => ({ ...donor }));
  },

  async update(donorId, patch) {
    await delay();
    const donor = donorStore.find((candidate) => candidate.donorId === donorId);
    if (!donor) {
      throw new Error(`Donor ${donorId} not found.`);
    }
    Object.assign(donor, patch, { updatedAt: new Date().toISOString() });
    return { ...donor };
  },

  async listComments(donorId) {
    await delay(150);
    return (commentStore[donorId] ?? []).map((comment) => ({ ...comment }));
  },

  async addComment(donorId, { author, body }) {
    await delay(150);
    const comment = {
      id: `cmt-${Date.now().toString(36)}`,
      author,
      body,
      createdAt: new Date().toISOString()
    };
    commentStore[donorId] = [...(commentStore[donorId] ?? []), comment];
    return comment;
  }
};
