import { prisma } from "./prisma";

export { toDateInput } from "./dates";

export async function getProfileOrCreate() {
  let profile = await prisma.studioProfile.findFirst();
  if (!profile) {
    profile = await prisma.studioProfile.create({
      data: { name: "Studio Musik Kamu" },
    });
  }
  return profile;
}

export async function getInvoice(id: string) {
  return prisma.invoice.findUnique({
    where: { id },
    include: { items: true },
  });
}
