import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { SCHOOLS } from "../lib/schools";

const prisma = new PrismaClient();

async function main() {
  for (const school of SCHOOLS) {
    await prisma.school.upsert({
      where: { id: school.id },
      update: school,
      create: school,
    });
  }
  await prisma.identityCounter.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, next: 1 },
  });

  const admins = [
    {
      email: required("SEED_SUPER_ADMIN_EMAIL"),
      password: required("SEED_SUPER_ADMIN_PASSWORD"),
      name: "Mayooran",
      role: "SUPER_ADMIN" as const,
    },
    {
      email: required("SEED_ADMIN_MUGUNTHAN_EMAIL"),
      password: required("SEED_ADMIN_MUGUNTHAN_PASSWORD"),
      name: "Mugunthan",
      role: "ADMIN" as const,
    },
    {
      email: required("SEED_ADMIN_RAMANAN_EMAIL"),
      password: required("SEED_ADMIN_RAMANAN_PASSWORD"),
      name: "Ramanan",
      role: "ADMIN" as const,
    },
  ];

  for (const admin of admins) {
    const email = admin.email.toLowerCase();
    const passwordHash = await bcrypt.hash(admin.password, 12);
    await prisma.user.upsert({
      where: { email },
      update: {
        name: admin.name,
        role: admin.role,
        status: "APPROVED",
        mustChangePassword: true,
        passwordHash,
      },
      create: {
        email,
        name: admin.name,
        role: admin.role,
        status: "APPROVED",
        mustChangePassword: true,
        passwordHash,
      },
    });
  }
}

function required(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is required to seed admin accounts`);
  return value;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
