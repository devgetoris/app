"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    companyName: "",
    industry: "",
    preferredTone: "professional" as "professional" | "casual" | "friendly" | "formal",
    emailSignature: "",
  });

  const handleSave = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/user/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      });

      if (!response.ok) {
        throw new Error("Failed to save settings");
      }

      toast.success("Settings saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error("Failed to save settings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account preferences and email settings
        </p>
      </div>

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle>Business Information</CardTitle>
          <CardDescription>
            Update your company details
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={settings.companyName}
              onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
              placeholder="Acme Inc."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              value={settings.industry}
              onChange={(e) => setSettings({ ...settings, industry: e.target.value })}
              placeholder="Technology"
            />
          </div>
        </CardContent>
      </Card>

      {/* Email Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Email Preferences</CardTitle>
          <CardDescription>
            Customize your email generation settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preferredTone">Default Email Tone</Label>
            <Select
              value={settings.preferredTone}
              onValueChange={(value: any) => setSettings({ ...settings, preferredTone: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select tone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="formal">Formal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailSignature">Email Signature</Label>
            <Textarea
              id="emailSignature"
              value={settings.emailSignature}
              onChange={(e) => setSettings({ ...settings, emailSignature: e.target.value })}
              placeholder="Best regards,&#10;Your Name&#10;Company Name"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      {/* API Keys */}
      <Card>
        <CardHeader>
          <CardTitle>API Configuration</CardTitle>
          <CardDescription>
            Your API keys are configured via environment variables
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <span>Apollo API</span>
              <span className="text-green-600 font-medium">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <span>OpenAI</span>
              <span className="text-green-600 font-medium">Connected</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <span>Resend</span>
              <span className="text-green-600 font-medium">Connected</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={loading} size="lg">
        {loading ? "Saving..." : "Save Settings"}
      </Button>
    </div>
  );
}


