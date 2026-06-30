import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { settingsSchema } from "@/lib/validations";

async function getOrCreateProfile() {
  let profile = await prisma.studioProfile.findFirst();
  if (!profile) {
    profile = await prisma.studioProfile.create({
      data: { name: "Studio Musik Kamu" },
    });
  }
  return profile;
}

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const profile = await getOrCreateProfile();
  return NextResponse.json(profile);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validasi gagal", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const profile = await getOrCreateProfile();
  const updated = await prisma.studioProfile.update({
    where: { id: profile.id },
    data: parsed.data,
  });
  return NextResponse.json(updated);
}
