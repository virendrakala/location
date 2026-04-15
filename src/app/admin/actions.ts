'use server';

import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createLink(formData: FormData) {
  const name = formData.get("name") as string;
  const destination = formData.get("destination") as string;
  if (!name || !destination) return;
  await prisma.link.create({ data: { name, destination } });
  revalidatePath("/admin");
}
