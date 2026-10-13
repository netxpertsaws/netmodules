import { describe, expect, it } from "vitest";
import { profileWriteStatus, toViewerProfile, type ProfileSource } from "@/lib/visibility";

const source: ProfileSource = {
  fullName: "Asha",
  fullNameTa: null,
  nickname: "Ash",
  gender: "female",
  dateOfBirth: new Date("1980-05-02T00:00:00.000Z"),
  schoolId: "school_hartley",
  schoolNameEn: "Hartley College",
  schoolNameTa: "ஹாட்லி கல்லூரி",
  alStream: "MATHS",
  admissionNo: "42",
  city: "Toronto",
  country: "Canada",
  address: "Hidden street",
  mobile: "+14165550123",
  whatsapp: "+14165550123",
  email: "asha@example.com",
  profession: "Engineer",
  employer: "Northwind",
  jobTitle: "Lead",
  maritalStatus: "married",
  spouseName: "Private",
  children: "Two",
  about: "Hello",
  facebook: null,
  linkedin: null,
  instagram: null,
  website: null,
  photoKey: "photos/11111111-1111-1111-1111-111111111111/full.webp",
  photoConsent: false,
  birthdayConsent: true,
  contactConsent: false,
  visibility: {
    mobile: "MEMBERS",
    whatsapp: "MEMBERS",
    address: "ADMINS_ONLY",
    spouseName: "ADMINS_ONLY",
    children: "ADMINS_ONLY",
    admissionNo: "ADMINS_ONLY",
    email: "MEMBERS",
    employer: "ADMINS_ONLY",
  },
  status: "APPROVED",
  identityNo: "VADA-001",
  deceasedAt: null,
};

describe("field visibility", () => {
  it("strips admin-only and non-consented fields for members", () => {
    const view = toViewerProfile(source, "MEMBER");
    expect(view.mobile).toBeNull();
    expect(view.email).toBeNull();
    expect(view.address).toBeNull();
    expect(view.spouseName).toBeNull();
    expect(view.admissionNo).toBeNull();
    expect(view.employer).toBeNull();
    expect(view.photoKey).toBeNull();
    expect(view.dateOfBirth).toBeNull();
    expect(view.birthday).toEqual({ month: 5, day: 2 });
    expect(view.profession).toBe("Engineer");
  });

  it("keeps the full record for admins", () => {
    const view = toViewerProfile(source, "ADMIN");
    expect(view.mobile).toBe("+14165550123");
    expect(view.address).toBe("Hidden street");
    expect(view.dateOfBirth).toBe("1980-05-02");
    expect(view.photoKey).toContain("full.webp");
  });
});

describe("member profile writes", () => {
  it("returns 403 for a member and 401 when signed out", () => {
    expect(profileWriteStatus("MEMBER")).toBe(403);
    expect(profileWriteStatus(null)).toBe(401);
    expect(profileWriteStatus("ADMIN")).toBe(200);
    expect(profileWriteStatus("SUPER_ADMIN")).toBe(200);
  });
});
