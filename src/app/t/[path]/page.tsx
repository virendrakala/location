import { headers } from "next/headers";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import VerifyHumanClient from "./ClientPage";

export const dynamic = 'force-dynamic';

export default async function TrackPage({ params }: { params: { path: string } }) {
  const link = await prisma.link.findUnique({ where: { path: params.path } });
  if (!link) return notFound();

  const headersList = headers();
  const forwardedFor = headersList.get('x-forwarded-for');
  const realIp = headersList.get('x-real-ip');
  
  // NextJS passes client IP in `x-forwarded-for` usually when behind a proxy (like Vercel)
  let ip = forwardedFor ? forwardedFor.split(',')[0] : realIp || 'Unknown';

  if (ip === "::1" || ip === "127.0.0.1" || ip === "Unknown") {
    // Attempt to get a real IP for dev testing if empty, otherwise fallback to 8.8.8.8 to mock
    try {
      const ipRes = await fetch('https://api.ipify.org?format=json');
      const ipData = await ipRes.json();
      ip = ipData.ip;
    } catch {
      ip = "8.8.8.8"; 
    }
  }

  let city, region, country;
  try {
    const res = await fetch(`http://ip-api.com/json/${ip}`);
    const data = await res.json();
    if (data.status === 'success') {
      city = data.city;
      region = data.regionName;
      country = data.country;
    }
  } catch(e) {
    console.error("IP Fetch error", e);
  }

  const userAgent = headersList.get('user-agent') || 'Unknown User Agent';

  const visit = await prisma.visit.create({
    data: {
      linkId: link.id,
      ip,
      city,
      region,
      country,
      userAgent
    }
  });

  return <VerifyHumanClient visitId={visit.id} destination={link.destination} />;
}
