"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateAdPayment } from "@/actions/ads";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { DollarSign } from "lucide-react";

interface OrganizerPaymentUpdateProps {
  adId: string;
  paymentStatus: string;
  amountPaid: number;
  paymentAmount: number;
}

export function OrganizerPaymentUpdate({ adId, paymentStatus, amountPaid, paymentAmount }: OrganizerPaymentUpdateProps) {
  const [status, setStatus] = useState(paymentStatus);
  const [amount, setAmount] = useState(String(amountPaid));
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSave = async () => {
    setLoading(true);
    await updateAdPayment(adId, {
      paymentStatus: status as "unpaid" | "partial" | "received",
      amountPaid: parseFloat(amount) || 0,
    });
    router.refresh();
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <DollarSign className="h-4 w-4" /> Payment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Total Due</span>
          <span className="font-semibold">{formatCurrency(paymentAmount)}</span>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Payment Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unpaid">Unpaid</SelectItem>
              <SelectItem value="partial">Partial Payment</SelectItem>
              <SelectItem value="received">Full Payment Received</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Amount Paid ($)</Label>
          <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
        </div>
        <Button size="sm" onClick={onSave} disabled={loading} className="w-full">
          {loading ? "Saving..." : "Update Payment"}
        </Button>
      </CardContent>
    </Card>
  );
}
