"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { completeOnboarding } from "@/actions/users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Building2 } from "lucide-react";

const schema = z.object({
  newOrgName: z.string().min(2, "Organization name must be at least 2 characters"),
});

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: { newOrgName: string }) => {
    setLoading(true);
    try {
      await completeOnboarding({ newOrgName: data.newOrgName });
      router.push("/dashboard");
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-3xl font-bold">BookletFlow</span>
          </div>
          <p className="text-muted-foreground">Welcome! Let's get you set up.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Your Organization
            </CardTitle>
            <CardDescription>
              Enter the name of your organization to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="newOrgName">Organization Name</Label>
                <Input
                  id="newOrgName"
                  placeholder="e.g. First Baptist Church"
                  {...register("newOrgName")}
                />
                {errors.newOrgName && (
                  <p className="text-sm text-destructive">{errors.newOrgName.message}</p>
                )}
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Setting up..." : "Get Started"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
