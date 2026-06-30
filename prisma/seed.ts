import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.SEED_EMAIL ?? "producer@studio.local";
  const password = process.env.SEED_PASSWORD ?? "changeme123";

  // Akun producer (1 user). Idempotent: update password kalau sudah ada.
  const hash = await bcrypt.hash(password, 10);
  await prisma.user.upsert({
    where: { email },
    update: { password: hash },
    create: { email, password: hash, name: "Producer" },
  });
  console.log(`✔ User siap: ${email}`);

  // Profil studio default (kalau belum ada satupun).
  const profileCount = await prisma.studioProfile.count();
  if (profileCount === 0) {
    await prisma.studioProfile.create({
      data: {
        name: "Studio Musik Kamu",
        address: "",
        contact: "",
        bankInfo: "",
      },
    });
    console.log("✔ Profil studio default dibuat");
  }

  // Sequence nomor invoice (singleton).
  await prisma.invoiceSequence.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", year: new Date().getFullYear(), count: 0 },
  });
  console.log("✔ Invoice sequence siap");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
