"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { updateAdStatus, updateAdPayment, uploadFinalDesign } from "@/actions/ads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UploadButton } from "@/lib/uploadthing";
import { CheckCircle, FileImage, DollarSign } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AdStatusManagerProps {
  ad: {
    id: string;
    adContentStatus: string;
    paymentStatus: string;
    amountPaid: number;
    paymentAmount: number;
    finalDesignUrl: string | null;
  };
  eventId: string;
}

export function AdStatusManager({ ad, eventId }: AdStatusManagerProps) {
  const router = useRouter();
  const [loadingStatus, setLoadingStatus] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [amountPaid, setAmountPaid] = useState(String(ad.amountPaid));
  const [paymentStatus, setPaymentStatus] = useState(ad.paymentStatus);

  const onStatusChange = async (status: string) => {
    setLoadingStatus(true);
    await updateAdStatus(ad.id, status as "pending" | "designing" | "complete");
    router.refresh();
    setLoadingStatus(false);
  };

  const onPaymentSave = async () => {
    setLoadingPayment(true);
    await updateAdPayment(ad.id, {
      paymentStatus: paymentStatus as "unpaid" | "partial" | "received",
      amountPaid: parseFloat(amountPaid) || 0,
    });
    router.refresh();
    setLoadingPayment(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Manage Ad</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Design Status</Label>
          <Select defaultValue={ad.adContentStatus} onValueChange={onStatusChange} disabled={loadingStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="designing">Designing</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Payment</Label>
          <div className="flex gap-2">
            <Select value={paymentStatus} onValueChange={setPaymentStatus}>
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="received">Received</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="number"
              value={amountPaid}
              onChange={(e) => setAmountPaid(e.target.value)}
              className="w-28"
              placeholder="Amount"
            />
          </div>
          <Button size="sm" variant="outline" onClick={onPaymentSave} disabled={loadingPayment} className="w-full">
            {loadingPayment ? "Saving..." : `Save Payment (${formatCurrency(ad.paymentAmount)} expected)`}
          </Button>
        </div>

        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Upload Final Design</Label>
          <UploadButton
            endpoint="finalDesign"
            onClientUploadComplete={async (res) => {
              if (res?.[0]?.url) {
                await uploadFinalDesign(ad.id, res[0].url);
                router.refresh();
              }
            }}
            onUploadError={(err) => alert(`Upload error: ${err.message}`)}
          />
          {ad.finalDesignUrl && (
            <p className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" /> Final design uploaded
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
