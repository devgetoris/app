"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface Email {
  id: string;
  subject: string;
  body: string;
  htmlBody: string | null;
  status: string | null;
  tone: string | null;
  createdAt: Date | null;
  sentAt: Date | null;
  scheduledAt: Date | null;
}

interface Lead {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  title: string | null;
  companyName: string | null;
}

export function EmailReviewCard({
  email,
  lead,
}: {
  email: Email;
  lead: Lead | null;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [editedSubject, setEditedSubject] = useState(email.subject);
  const [editedBody, setEditedBody] = useState(email.body);
  const [loading, setLoading] = useState(false);

  const leadName = lead
    ? `${lead.firstName || ""} ${lead.lastName || ""}`.trim()
    : "Unknown";

  const handleSend = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/emails/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailId: email.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to send email");
      }

      toast.success("Email sent successfully!");
      router.refresh();
    } catch (error) {
      console.error("Send error:", error);
      toast.error("Failed to send email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    try {
      setLoading(true);

      const response = await fetch("/api/emails/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          emailId: email.id,
          subject: editedSubject,
          body: editedBody,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update email");
      }

      toast.success("Email updated successfully!");
      setIsEditing(false);
      router.refresh();
    } catch (error) {
      console.error("Update error:", error);
      toast.error("Failed to update email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{leadName}</h3>
              <Badge
                variant={email.status === "sent" ? "default" : "secondary"}
              >
                {email.status}
              </Badge>
              {email.tone && <Badge variant="outline">{email.tone}</Badge>}
            </div>
            {lead && (
              <div className="text-sm text-muted-foreground">
                {lead.title} at {lead.companyName}
                <br />
                To: {lead.email}
              </div>
            )}
            {email.sentAt && (
              <div className="text-sm text-muted-foreground mt-1">
                Sent: {new Date(email.sentAt).toLocaleString()}
              </div>
            )}
            {email.scheduledAt && (
              <div className="text-sm text-muted-foreground mt-1">
                Scheduled: {new Date(email.scheduledAt).toLocaleString()}
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {isEditing ? (
          <>
            <div className="space-y-2">
              <Label>Subject</Label>
              <Textarea
                value={editedSubject}
                onChange={e => setEditedSubject(e.target.value)}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Body</Label>
              <Textarea
                value={editedBody}
                onChange={e => setEditedBody(e.target.value)}
                rows={10}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleUpdate} disabled={loading}>
                {loading ? "Saving..." : "Save Changes"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditedSubject(email.subject);
                  setEditedBody(email.body);
                }}
              >
                Cancel
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label>Subject</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm font-medium">{email.subject}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Body</Label>
              <div className="p-4 bg-muted rounded-md max-h-96 overflow-y-auto">
                <p className="text-sm whitespace-pre-wrap">{email.body}</p>
              </div>
            </div>

            {email.status !== "sent" && (
              <div className="flex gap-2">
                <Button onClick={handleSend} disabled={loading}>
                  {loading ? "Sending..." : "Send Now"}
                </Button>
                <Button variant="outline" onClick={() => setIsEditing(true)}>
                  Edit
                </Button>
                <Button variant="outline">Schedule</Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}