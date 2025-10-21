"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const STEPS = [
  { id: 1, title: "Business Information", description: "Tell us about your company" },
  { id: 2, title: "Marketing Goals", description: "What are you trying to achieve?" },
  { id: 3, title: "Target Audience", description: "Who are your ideal prospects?" },
  { id: 4, title: "Email Preferences", description: "How should we communicate?" },
  { id: 5, title: "Automation Rules", description: "Set up smart automation" },
];

const MARKETING_GOALS = [
  "Lead Generation",
  "Customer Acquisition",
  "Brand Awareness",
  "Partnership Development",
  "Event Promotion",
  "Product Launch",
];

const JOB_TITLES = [
  "CEO", "CTO", "CFO", "CMO", "COO",
  "VP of Sales", "VP of Marketing", "VP of Engineering",
  "Director", "Manager", "Founder",
];

const INDUSTRIES = [
  "Technology", "Finance", "Healthcare", "E-commerce",
  "SaaS", "Marketing", "Consulting", "Education",
  "Real Estate", "Manufacturing", "Retail",
];

const COMPANY_SIZES = [
  "1-10", "11-50", "51-200", "201-500",
  "501-1000", "1001-5000", "5001+",
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    companySize: "",
    targetMarket: "",
    marketingGoals: [] as string[],
    targetJobTitles: [] as string[],
    targetIndustries: [] as string[],
    targetCompanySizes: [] as string[],
    targetLocations: "",
    preferredTone: "professional" as "professional" | "casual" | "friendly" | "formal",
    emailStyle: "",
    callToActionTypes: [] as string[],
    emailSignature: "",
    autoSendCriteria: "",
  });

  const handleNext = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          targetLocations: formData.targetLocations.split(",").map(l => l.trim()).filter(Boolean),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to complete onboarding");
      }

      toast.success("Onboarding completed successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Onboarding error:", error);
      toast.error("Failed to complete onboarding. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const toggleArrayItem = (key: keyof typeof formData, value: string) => {
    const currentArray = formData[key] as string[];
    if (currentArray.includes(value)) {
      setFormData({
        ...formData,
        [key]: currentArray.filter(item => item !== value),
      });
    } else {
      setFormData({
        ...formData,
        [key]: [...currentArray, value],
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12">
      <div className="container max-w-3xl mx-auto px-4">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    currentStep >= step.id
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-200 dark:bg-gray-800 text-gray-500"
                  }`}
                >
                  {step.id}
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-16 h-1 mx-2 ${
                      currentStep > step.id ? "bg-primary" : "bg-gray-200 dark:bg-gray-800"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
            <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Business Information */}
            {currentStep === 1 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name</Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Acme Inc."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Select value={formData.industry} onValueChange={(value) => setFormData({ ...formData, industry: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(industry => (
                        <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companySize">Company Size</Label>
                  <Select value={formData.companySize} onValueChange={(value) => setFormData({ ...formData, companySize: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZES.map(size => (
                        <SelectItem key={size} value={size}>{size} employees</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetMarket">Target Market</Label>
                  <Textarea
                    id="targetMarket"
                    value={formData.targetMarket}
                    onChange={(e) => setFormData({ ...formData, targetMarket: e.target.value })}
                    placeholder="Describe your target market..."
                    rows={3}
                  />
                </div>
              </>
            )}

            {/* Step 2: Marketing Goals */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <Label>Select your marketing goals (choose all that apply)</Label>
                {MARKETING_GOALS.map(goal => (
                  <div key={goal} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal}
                      checked={formData.marketingGoals.includes(goal)}
                      onCheckedChange={() => toggleArrayItem("marketingGoals", goal)}
                    />
                    <label
                      htmlFor={goal}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {goal}
                    </label>
                  </div>
                ))}
              </div>
            )}

            {/* Step 3: Target Audience */}
            {currentStep === 3 && (
              <>
                <div className="space-y-4">
                  <Label>Target Job Titles</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {JOB_TITLES.map(title => (
                      <div key={title} className="flex items-center space-x-2">
                        <Checkbox
                          id={`title-${title}`}
                          checked={formData.targetJobTitles.includes(title)}
                          onCheckedChange={() => toggleArrayItem("targetJobTitles", title)}
                        />
                        <label
                          htmlFor={`title-${title}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {title}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Target Industries</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {INDUSTRIES.map(industry => (
                      <div key={industry} className="flex items-center space-x-2">
                        <Checkbox
                          id={`industry-${industry}`}
                          checked={formData.targetIndustries.includes(industry)}
                          onCheckedChange={() => toggleArrayItem("targetIndustries", industry)}
                        />
                        <label
                          htmlFor={`industry-${industry}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {industry}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-4">
                  <Label>Target Company Sizes</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {COMPANY_SIZES.map(size => (
                      <div key={size} className="flex items-center space-x-2">
                        <Checkbox
                          id={`size-${size}`}
                          checked={formData.targetCompanySizes.includes(size)}
                          onCheckedChange={() => toggleArrayItem("targetCompanySizes", size)}
                        />
                        <label
                          htmlFor={`size-${size}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {size} employees
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetLocations">Target Locations</Label>
                  <Input
                    id="targetLocations"
                    value={formData.targetLocations}
                    onChange={(e) => setFormData({ ...formData, targetLocations: e.target.value })}
                    placeholder="e.g., United States, Canada, United Kingdom (comma-separated)"
                  />
                </div>
              </>
            )}

            {/* Step 4: Email Preferences */}
            {currentStep === 4 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="preferredTone">Email Tone</Label>
                  <Select value={formData.preferredTone} onValueChange={(value: any) => setFormData({ ...formData, preferredTone: value })}>
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
                  <Label htmlFor="emailStyle">Email Style Guidelines (Optional)</Label>
                  <Textarea
                    id="emailStyle"
                    value={formData.emailStyle}
                    onChange={(e) => setFormData({ ...formData, emailStyle: e.target.value })}
                    placeholder="Any specific style preferences or guidelines..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailSignature">Email Signature</Label>
                  <Textarea
                    id="emailSignature"
                    value={formData.emailSignature}
                    onChange={(e) => setFormData({ ...formData, emailSignature: e.target.value })}
                    placeholder={`Best regards,\n${user?.fullName || "Your Name"}\n${formData.companyName || "Company"}`}
                    rows={4}
                  />
                </div>
              </>
            )}

            {/* Step 5: Automation Rules */}
            {currentStep === 5 && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="autoSendCriteria">Auto-Send Criteria (Optional)</Label>
                  <Textarea
                    id="autoSendCriteria"
                    value={formData.autoSendCriteria}
                    onChange={(e) => setFormData({ ...formData, autoSendCriteria: e.target.value })}
                    placeholder="Describe when emails should be sent automatically vs requiring manual review. For example: 'Auto-send to managers and below in tech companies with 50+ employees. Manual review for C-level executives.'"
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank to manually review all emails. You can always adjust automation rules later in settings.
                  </p>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Default Automation</h4>
                  <p className="text-sm text-muted-foreground">
                    By default, all generated emails will be queued for your review before sending.
                    This ensures you maintain control over your outreach while the AI handles the heavy lifting.
                  </p>
                </div>
              </>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-6">
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={currentStep === 1}
              >
                Back
              </Button>

              {currentStep < STEPS.length ? (
                <Button onClick={handleNext}>
                  Next
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? "Completing..." : "Complete Onboarding"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}


