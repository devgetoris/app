"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "@/components/ui/multi-select";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const STEPS = [
  {
    id: 1,
    title: "Business Information",
    description: "Tell us about your company",
  },
  {
    id: 2,
    title: "Marketing Goals",
    description: "What are you trying to achieve?",
  },
  {
    id: 3,
    title: "Target Audience",
    description: "Who are your ideal prospects?",
  },
  {
    id: 4,
    title: "Email Preferences",
    description: "How should we communicate?",
  },
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
  "CEO",
  "CTO",
  "COO",
  "CFO",
  "VP of Engineering",
  "VP of Sales",
  "VP of Marketing",
  "Engineering Manager",
  "Product Manager",
  "Sales Manager",
  "Director of Engineering",
  "Director of Sales",
  "Director of Marketing",
  "Head of Product",
  "Head of Engineering",
  "Head of Sales",
  "Software Engineer",
  "Senior Software Engineer",
  "Lead Developer",
  "Marketing Manager",
  "Sales Representative",
  "Account Executive",
].map(title => ({ label: title, value: title }));

const INDUSTRIES = [
  "Computer Software",
  "Information Technology",
  "Internet",
  "Financial Services",
  "Banking",
  "Insurance",
  "E-commerce",
  "Retail",
  "Consumer Goods",
  "Healthcare",
  "Biotechnology",
  "Pharmaceuticals",
  "Education",
  "EdTech",
  "Online Learning",
  "Marketing",
  "Advertising",
  "Public Relations",
  "Real Estate",
  "Construction",
  "Architecture",
  "Manufacturing",
  "Logistics",
  "Supply Chain",
  "Media",
  "Entertainment",
  "Gaming",
  "Telecommunications",
  "Cloud Computing",
  "Cybersecurity",
].map(industry => ({ label: industry, value: industry }));

const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1001-5000",
  "5001-10000",
  "10001+",
].map(size => ({ label: `${size} employees`, value: size }));

const LOCATIONS = [
  "United States",
  "United Kingdom",
  "Canada",
  "Germany",
  "France",
  "Netherlands",
  "Sweden",
  "Denmark",
  "Norway",
  "Finland",
  "Australia",
  "New Zealand",
  "Singapore",
  "Hong Kong",
  "India",
  "Japan",
  "South Korea",
  "Brazil",
  "Mexico",
  "Argentina",
  "San Francisco",
  "New York",
  "Los Angeles",
  "Boston",
  "Seattle",
  "London",
  "Berlin",
  "Amsterdam",
  "Paris",
  "Toronto",
].map(location => ({ label: location, value: location }));

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
    targetLocations: [] as string[],
    preferredTone: "professional" as
      | "professional"
      | "casual"
      | "friendly"
      | "formal",
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
        body: JSON.stringify(formData),
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
    <div className="min-h-screen bg-background">
      <div className="container max-w-4xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">
                O
              </span>
            </div>
            <span className="text-2xl font-bold">OrisAI</span>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-12">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-[2px] bg-muted -z-10">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%`,
                }}
              />
            </div>

            {STEPS.map(step => (
              <div key={step.id} className="flex flex-col items-center gap-2">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${
                    currentStep >= step.id
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "bg-background border-2 border-muted text-muted-foreground"
                  }`}
                >
                  {step.id}
                </div>
                <span className="text-xs font-medium text-muted-foreground max-w-[80px] text-center leading-tight hidden sm:block">
                  {step.title.split(" ")[0]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-none bg-background">
          <CardHeader className="px-0 pt-0">
            <CardTitle className="text-2xl font-semibold">
              {STEPS[currentStep - 1].title}
            </CardTitle>
            <CardDescription className="text-base">
              {STEPS[currentStep - 1].description}
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 pb-0 space-y-8">
            {/* Step 1: Business Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label htmlFor="companyName" className="text-sm font-medium">
                    Company Name
                  </Label>
                  <Input
                    id="companyName"
                    value={formData.companyName}
                    onChange={e =>
                      setFormData({ ...formData, companyName: e.target.value })
                    }
                    placeholder="Acme Inc."
                    className="h-11"
                  />
                </div>

                <div className="space-y-3">
                  <Label htmlFor="industry" className="text-sm font-medium">
                    Industry
                  </Label>
                  <Select
                    value={formData.industry}
                    onValueChange={value =>
                      setFormData({ ...formData, industry: value })
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map(industry => (
                        <SelectItem key={industry.value} value={industry.value}>
                          {industry.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="companySize" className="text-sm font-medium">
                    Company Size
                  </Label>
                  <Select
                    value={formData.companySize}
                    onValueChange={value =>
                      setFormData({ ...formData, companySize: value })
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select company size" />
                    </SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZES.map(size => (
                        <SelectItem key={size.value} value={size.value}>
                          {size.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="targetMarket" className="text-sm font-medium">
                    Target Market
                  </Label>
                  <Textarea
                    id="targetMarket"
                    value={formData.targetMarket}
                    onChange={e =>
                      setFormData({ ...formData, targetMarket: e.target.value })
                    }
                    placeholder="Describe your ideal customers and target market..."
                    rows={4}
                    className="resize-none"
                  />
                </div>
              </div>
            )}

            {/* Step 2: Marketing Goals */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <Label className="text-sm font-medium">
                  Select your marketing goals
                </Label>
                <div className="space-y-3">
                  {MARKETING_GOALS.map(goal => (
                    <div
                      key={goal}
                      className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => toggleArrayItem("marketingGoals", goal)}
                    >
                      <Checkbox
                        id={goal}
                        checked={formData.marketingGoals.includes(goal)}
                        onCheckedChange={() =>
                          toggleArrayItem("marketingGoals", goal)
                        }
                      />
                      <label
                        htmlFor={goal}
                        className="text-sm font-medium leading-none cursor-pointer flex-1"
                      >
                        {goal}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Target Audience */}
            {currentStep === 3 && (
              <>
                <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                  <p className="text-sm font-medium mb-1">
                    Define Your Ideal Customer Profile
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Select multiple options to help us find the right prospects
                    for your business.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Target Job Titles
                    </Label>
                    <MultiSelect
                      options={JOB_TITLES}
                      onValueChange={values =>
                        setFormData({ ...formData, targetJobTitles: values })
                      }
                      defaultValue={formData.targetJobTitles}
                      placeholder="Select job titles"
                      variant="secondary"
                      maxCount={4}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Target Industries
                    </Label>
                    <MultiSelect
                      options={INDUSTRIES}
                      onValueChange={values =>
                        setFormData({ ...formData, targetIndustries: values })
                      }
                      defaultValue={formData.targetIndustries}
                      placeholder="Select industries"
                      variant="secondary"
                      maxCount={4}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Target Company Sizes
                    </Label>
                    <MultiSelect
                      options={COMPANY_SIZES}
                      onValueChange={values =>
                        setFormData({ ...formData, targetCompanySizes: values })
                      }
                      defaultValue={formData.targetCompanySizes}
                      placeholder="Select company sizes"
                      variant="secondary"
                      maxCount={4}
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-sm font-medium">
                      Target Locations
                    </Label>
                    <MultiSelect
                      options={LOCATIONS}
                      onValueChange={values =>
                        setFormData({ ...formData, targetLocations: values })
                      }
                      defaultValue={formData.targetLocations}
                      placeholder="Select locations"
                      variant="secondary"
                      maxCount={4}
                    />
                  </div>
                </div>
              </>
            )}

            {/* Step 4: Email Preferences */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="preferredTone"
                    className="text-sm font-medium"
                  >
                    Email Tone
                  </Label>
                  <Select
                    value={formData.preferredTone}
                    onValueChange={(value: any) =>
                      setFormData({ ...formData, preferredTone: value })
                    }
                  >
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Select preferred tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="formal">Formal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="emailStyle" className="text-sm font-medium">
                    Email Style Guidelines
                    <span className="text-muted-foreground font-normal ml-2">
                      (Optional)
                    </span>
                  </Label>
                  <Textarea
                    id="emailStyle"
                    value={formData.emailStyle}
                    onChange={e =>
                      setFormData({ ...formData, emailStyle: e.target.value })
                    }
                    placeholder="Any specific style preferences or guidelines for your emails..."
                    rows={4}
                    className="resize-none"
                  />
                </div>

                <div className="space-y-3">
                  <Label
                    htmlFor="emailSignature"
                    className="text-sm font-medium"
                  >
                    Email Signature
                  </Label>
                  <Textarea
                    id="emailSignature"
                    value={formData.emailSignature}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        emailSignature: e.target.value,
                      })
                    }
                    placeholder={`Best regards,\n${user?.fullName || "Your Name"}\n${formData.companyName || "Company"}`}
                    rows={4}
                    className="resize-none font-mono text-sm"
                  />
                </div>
              </div>
            )}

            {/* Step 5: Automation Rules */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div className="space-y-3">
                  <Label
                    htmlFor="autoSendCriteria"
                    className="text-sm font-medium"
                  >
                    Auto-Send Criteria
                    <span className="text-muted-foreground font-normal ml-2">
                      (Optional)
                    </span>
                  </Label>
                  <Textarea
                    id="autoSendCriteria"
                    value={formData.autoSendCriteria}
                    onChange={e =>
                      setFormData({
                        ...formData,
                        autoSendCriteria: e.target.value,
                      })
                    }
                    placeholder="Describe when emails should be sent automatically vs requiring manual review. For example: 'Auto-send to managers and below in tech companies with 50+ employees. Manual review for C-level executives.'"
                    rows={6}
                    className="resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    Leave blank to manually review all emails. You can adjust
                    automation rules later in settings.
                  </p>
                </div>

                <div className="border rounded-lg p-4 bg-muted/50">
                  <h4 className="font-medium text-sm mb-2">
                    Default Automation
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    By default, all generated emails will be queued for your
                    review before sending. This ensures you maintain control
                    over your outreach while the AI handles the heavy lifting.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-8 mt-8 border-t">
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="h-11"
              >
                Back
              </Button>

              {currentStep < STEPS.length ? (
                <Button onClick={handleNext} className="h-11 px-8">
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="h-11 px-8"
                >
                  {loading ? "Setting up..." : "Complete Setup"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
