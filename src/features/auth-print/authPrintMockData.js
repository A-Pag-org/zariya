export const authPrintMockData = {
  organization: {
    name: "Zariya Health Services",
    subtitle: "Authentication & Access Record"
  },
  metadata: {
    documentId: "ZA-2026-44701",
    generatedAt: "2026-07-01T09:58:00.000Z",
    generatedBy: "system.service.account@zariya.io",
    environment: "Production"
  },
  subject: {
    fullName: "Amina Khan",
    memberId: "MEM-931028",
    dateOfBirth: "1995-03-11",
    email: "amina.khan@example.com",
    phone: "+91 98765 43210"
  },
  authStatus: {
    level: "Verified",
    method: "Government ID + OTP",
    lastValidatedAt: "2026-06-30T16:12:00.000Z",
    expiresAt: "2027-06-30T16:12:00.000Z"
  },
  accessSummary: [
    {
      service: "Claims Portal",
      role: "Member",
      status: "Active"
    },
    {
      service: "Care Provider Network",
      role: "Verified User",
      status: "Active"
    },
    {
      service: "Prescription Refill",
      role: "Self-Service",
      status: "Restricted"
    }
  ],
  auditTrail: [
    {
      timestamp: "2026-06-30T16:12:00.000Z",
      actor: "Auth Gateway",
      event: "Identity verification completed"
    },
    {
      timestamp: "2026-06-30T16:12:05.000Z",
      actor: "Policy Engine",
      event: "Access token issued for member portal"
    },
    {
      timestamp: "2026-06-30T16:15:47.000Z",
      actor: "Fraud Monitor",
      event: "Risk score remained under threshold"
    }
  ],
  disclaimer:
    "This document is system-generated for operational and compliance usage. Please verify the latest status directly from the live platform before making critical decisions."
};
