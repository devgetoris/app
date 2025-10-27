"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Loader2,
  Mail,
  Send,
  CheckCircle,
  X,
  Minimize2,
  Maximize2,
  Reply,
  Forward,
  Archive,
} from "lucide-react";

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string | null;
    title: string | null;
    companyName: string | null;
  };
}

interface GeneratedEmail {
  subject: string;
  body: string;
  htmlBody: string;
}

export function EmailPreviewModal({
  isOpen,
  onClose,
  lead,
}: EmailPreviewModalProps) {
  const [generatedEmail, setGeneratedEmail] = useState<GeneratedEmail | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  const leadName = `${lead.firstName || ""} ${lead.lastName || ""}`.trim();
  const leadEmail =
    lead.email && !lead.email.includes("email_not_unlocked")
      ? lead.email
      : null;

  const handleGenerateEmail = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/emails/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          leadId: lead.id,
          saveAsDraft: false, // Don't save to database, just generate
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate email");
      }

      const data = await response.json();
      setGeneratedEmail(data.email);
    } catch (error) {
      console.error("Error generating email:", error);
      // You could add a toast notification here
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendEmail = async () => {
    setIsSending(true);
    try {
      // Simulate sending email - replace with actual API call later
      await new Promise(resolve => setTimeout(resolve, 2000));
      setEmailSent(true);

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        setEmailSent(false);
        setGeneratedEmail(null);
      }, 2000);
    } catch (error) {
      console.error("Error sending email:", error);
    } finally {
      setIsSending(false);
    }
  };

  const handleClose = () => {
    onClose();
    setGeneratedEmail(null);
    setEmailSent(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-40" onClick={handleClose} />

      {/* Modal */}
      <div
        className={`fixed bottom-4 right-4 w-[500px] z-50 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col ${
          isMinimized ? "h-16" : "h-[600px]"
        }`}
      >
        {/* Gmail-style Header */}
        <div className="bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <Mail className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">Compose Email</h3>
              <p className="text-xs text-muted-foreground">to {leadName}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
              className="h-8 w-8 p-0"
            >
              {isMinimized ? (
                <Maximize2 className="w-4 h-4" />
              ) : (
                <Minimize2 className="w-4 h-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {!isMinimized ? (
          <div className="flex-1 flex flex-col">
            {/* Email Generation State */}
            {!generatedEmail && !isGenerating && (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold">
                      Generate Personalized Email
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Create a personalized email for {leadName} using AI
                    </p>
                  </div>
                  <Button
                    onClick={handleGenerateEmail}
                    size="lg"
                    className="w-full"
                  >
                    Generate Email
                  </Button>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isGenerating && (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <Loader2 className="w-8 h-8 mx-auto animate-spin text-blue-600" />
                  <div>
                    <h3 className="text-lg font-semibold">
                      Generating Email...
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      AI is creating a personalized email for {leadName}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Gmail-style Email Interface */}
            {generatedEmail && !emailSent && (
              <div className="flex-1 flex flex-col">
                {/* Email Header */}
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="space-y-3">
                    {/* To Field */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-8">
                        To:
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium">
                            {leadName
                              .split(" ")
                              .map(n => n[0])
                              .join("")
                              .toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm font-medium">{leadName}</span>
                        <span className="text-sm text-muted-foreground">
                          {leadEmail
                            ? `<${leadEmail}>`
                            : "(email not available)"}
                        </span>
                      </div>
                    </div>

                    {/* Subject Field */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-8">
                        Subject:
                      </span>
                      <div className="flex-1">
                        <input
                          type="text"
                          value={generatedEmail.subject}
                          readOnly
                          className="w-full text-sm font-medium bg-transparent border-none outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Email Body */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="prose prose-sm max-w-none dark:prose-invert">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: generatedEmail.htmlBody,
                      }}
                    />
                  </div>
                </div>

                {/* Action Bar */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleSendEmail}
                        disabled={isSending || !leadEmail}
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        {isSending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerateEmail}
                        disabled={isSending}
                      >
                        Regenerate
                      </Button>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Reply className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Forward className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Archive className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {!leadEmail && (
                    <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-2 rounded">
                      ⚠️ Email address not available for this lead. Cannot send
                      email.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Email Sent Confirmation */}
            {emailSent && (
              <div className="flex-1 flex items-center justify-center p-8">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">
                      Email Sent Successfully!
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      Your personalized email has been sent to {leadName}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <span className="text-sm text-muted-foreground">Minimized</span>
          </div>
        )}
      </div>
    </>
  );
}
