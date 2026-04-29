import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { CsvExportButton } from "@/components/admin/csv-export-button";
import { DollarSign, FileImage, TrendingUp } from "lucide-react";

export default async function ReportsPage() {
  await requireAdmin();

  const events = await prisma.event.findMany({
    where: { deletedAt: null },
    include: {
      organization: { select: { name: true } },
      ads: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const totalRevenue = events.reduce(
    (sum, e) => sum + e.ads.reduce((s, a) => s + Number(a.amountPaid), 0),
    0
  );
  const totalExpected = events.reduce(
    (sum, e) => sum + e.ads.reduce((s, a) => s + Number(a.paymentAmount), 0),
    0
  );
  const totalAds = events.reduce((sum, e) => sum + e.ads.length, 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Reports</h2>
        <p className="text-muted-foreground">Revenue and ad statistics across all events</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <DollarSign className="h-8 w-8 text-green-500" />
            <div>
              <p className="font-bold text-xl">{formatCurrency(totalRevenue)}</p>
              <p className="text-xs text-muted-foreground">Total Collected</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <TrendingUp className="h-8 w-8 text-blue-500" />
            <div>
              <p className="font-bold text-xl">{formatCurrency(totalExpected)}</p>
              <p className="text-xs text-muted-foreground">Total Expected</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <FileImage className="h-8 w-8 text-purple-500" />
            <div>
              <p className="font-bold text-xl">{totalAds}</p>
              <p className="text-xs text-muted-foreground">Total Ads</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        {events.map((event) => {
          const revenue = event.ads.reduce((s, a) => s + Number(a.amountPaid), 0);
          const expected = event.ads.reduce((s, a) => s + Number(a.paymentAmount), 0);
          const fullAds = event.ads.filter((a) => a.adType === "full_page").length;
          const halfAds = event.ads.filter((a) => a.adType === "half_page").length;
          const unpaid = event.ads.filter((a) => a.paymentStatus !== "received").length;

          return (
            <Card key={event.id}>
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <div>
                  <CardTitle className="text-base">{event.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{event.organization.name}</p>
                </div>
                <CsvExportButton eventId={event.id} eventName={event.name} />
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground text-xs">Total Ads</p>
                    <p className="font-semibold">{event.ads.length}</p>
                    <p className="text-xs text-muted-foreground">{fullAds} full · {halfAds} half</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Revenue Collected</p>
                    <p className="font-semibold text-green-600">{formatCurrency(revenue)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Expected</p>
                    <p className="font-semibold">{formatCurrency(expected)}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Outstanding</p>
                    <p className={`font-semibold ${expected - revenue > 0 ? "text-yellow-600" : "text-green-600"}`}>
                      {formatCurrency(expected - revenue)}
                    </p>
                    <p className="text-xs text-muted-foreground">{unpaid} unpaid ad{unpaid !== 1 ? "s" : ""}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
