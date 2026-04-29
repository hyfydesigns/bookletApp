import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user: supabaseUser } } = await supabase.auth.getUser();
  if (!supabaseUser) return new NextResponse("Unauthorized", { status: 401 });

  const user = await prisma.user.findUnique({ where: { supabaseId: supabaseUser.id } });
  if (!user || user.role !== "admin") return new NextResponse("Forbidden", { status: 403 });

  const eventId = request.nextUrl.searchParams.get("eventId");
  if (!eventId) return new NextResponse("Missing eventId", { status: 400 });

  const ads = await prisma.ad.findMany({
    where: { eventId },
    include: { submittedBy: { select: { name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  const headers = [
    "Ad Code",
    "Advertiser Name",
    "Contact Person",
    "Contact Email",
    "Contact Phone",
    "Ad Type",
    "Design Status",
    "Payment Status",
    "Rate",
    "Amount Paid",
    "Outstanding",
    "Page Number",
    "Page Slot",
    "Ad Message",
    "Notes",
    "Submitted By",
    "Submitted Date",
  ];

  const rows = ads.map((ad) => [
    ad.adCode,
    ad.advertiserName,
    ad.contactPerson ?? "",
    ad.contactEmail ?? "",
    ad.contactPhone ?? "",
    ad.adType === "full_page" ? "Full Page" : "Half Page",
    ad.adContentStatus,
    ad.paymentStatus,
    `$${Number(ad.paymentAmount).toFixed(2)}`,
    `$${Number(ad.amountPaid).toFixed(2)}`,
    `$${(Number(ad.paymentAmount) - Number(ad.amountPaid)).toFixed(2)}`,
    ad.pageNumber ?? "",
    ad.pageSlot ?? "",
    ad.adMessage ?? "",
    ad.notes ?? "",
    ad.submittedBy?.name ?? "",
    new Date(ad.createdAt).toLocaleDateString(),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="ads_${eventId}.csv"`,
    },
  });
}
