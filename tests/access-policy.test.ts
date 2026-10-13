import { describe, expect, it } from "vitest";
import { decideAccess } from "@/lib/access-policy";

const pending = { role: "MEMBER" as const, status: "PENDING" as const };
const member = { role: "MEMBER" as const, status: "APPROVED" as const, totpOk: false };
const admin = { role: "ADMIN" as const, status: "APPROVED" as const, totpEnabled: true, totpOk: true };
const superAdmin = { role: "SUPER_ADMIN" as const, status: "APPROVED" as const, totpEnabled: true, totpOk: true };

describe("route access", () => {
  it("blocks pending users from the member area and the admin panel", () => {
    expect(decideAccess({ pathname: "/en/home", ...pending }).type).toBe("redirect");
    expect(decideAccess({ pathname: "/admin", ...pending }).type).toBe("redirect");
    expect(decideAccess({ pathname: "/api/admin/reports", ...pending })).toMatchObject({ type: "deny", status: 403 });
  });

  it("blocks members from admin routes", () => {
    expect(decideAccess({ pathname: "/admin", ...member })).toMatchObject({ type: "redirect" });
    expect(decideAccess({ pathname: "/admin/members", ...member }).type).toBe("redirect");
    expect(decideAccess({ pathname: "/api/admin/reports", ...member })).toMatchObject({ type: "deny", status: 403 });
  });

  it("lets approved members into the member area", () => {
    expect(decideAccess({ pathname: "/ta/members", ...member })).toEqual({ type: "allow" });
  });

  it("sends an admin without 2FA to the challenge", () => {
    expect(decideAccess({ pathname: "/admin/members", ...admin, totpOk: false })).toMatchObject({
      type: "redirect",
      to: "/admin/2fa",
    });
    expect(decideAccess({ pathname: "/admin/2fa", ...admin, totpOk: false })).toEqual({ type: "allow" });
  });

  it("reserves reports and admin management for the super admin", () => {
    expect(decideAccess({ pathname: "/admin/reports", ...admin })).toMatchObject({ type: "redirect", to: "/admin?error=super" });
    expect(decideAccess({ pathname: "/admin/admins", ...admin }).type).toBe("redirect");
    expect(decideAccess({ pathname: "/admin/reports", ...superAdmin })).toEqual({ type: "allow" });
    expect(decideAccess({ pathname: "/api/admin/reports", ...admin })).toMatchObject({ type: "deny", status: 403 });
    expect(decideAccess({ pathname: "/api/admin/reports", ...superAdmin })).toEqual({ type: "allow" });
  });

  it("leaves the public home and login open", () => {
    expect(decideAccess({ pathname: "/" })).toEqual({ type: "allow" });
    expect(decideAccess({ pathname: "/login" })).toEqual({ type: "allow" });
  });
});
