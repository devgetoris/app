"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface LeadEmailGeneratorProps {
  leadId: string;
}

export function LeadEmailGenerator({ leadId }: LeadEmailGeneratorProps) {
  const [loading, setLoading] = useState(false);
  const [tone, setTone] = useState<string>("professional");
  const [customPrompt, setCustomPrompt] = useState("");
  const [generatedEmail, setGeneratedEmail] = useState<{
    subject: string;
    body: string;
    htmlBody: string;
  } | null>(null);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setGeneratedEmail(null);

      const response = await fetch("/api/emails/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId,
          tone,
          customPrompt: customPrompt || undefined,
          saveAsDraft: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate email");
      }

      const data = await response.json();
      
      setGeneratedEmail({
        subject: data.email.subject,
        body: data.email.body,
        htmlBody: data.email.htmlBody,
      });

      toast.success("Email generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error("Failed to generate email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Generate Personalized Email</CardTitle>
          <CardDescription>
            Use AI to create a personalized email for this lead
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="tone">Email Tone</Label>
            <Select value={tone} onValueChange={setTone}>
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
            <Label htmlFor="customPrompt">Additional Instructions (Optional)</Label>
            <Textarea
              id="customPrompt"
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="Any specific points you want to mention or focus on..."
              rows={3}
            />
          </div>

          <Button onClick={handleGenerate} disabled={loading} className="w-full">
            {loading ? "Generating..." : "Generate Email"}
          </Button>
        </CardContent>
      </Card>

      {generatedEmail && (
        <Card>
          <CardHeader>
            <CardTitle>Generated Email</CardTitle>
            <CardDescription>
              Review the email below. It has been saved as a draft.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">{generatedEmail.subject}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Body</Label>
              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm whitespace-pre-wrap">{generatedEmail.body}</p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={handleGenerate}>
                Regenerate
              </Button>
              <Button>
                Review & Send
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


