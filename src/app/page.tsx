import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg" />
            <span className="text-xl font-bold">LeadFlow</span>
          </div>
          <nav className="flex items-center gap-4">
            <Link href="/sign-in">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/sign-up">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl font-bold tracking-tight mb-6">
          AI-Powered Lead Generation
          <br />
          <span className="text-primary">Made Simple</span>
        </h1>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Find perfect leads with Apollo API, generate personalized emails with AI,
          and scale your outreach with intelligent automation.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/sign-up">
            <Button size="lg" className="text-lg px-8">
              Start Free Trial
            </Button>
          </Link>
          <Button size="lg" variant="outline" className="text-lg px-8">
            Watch Demo
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">
          Everything You Need to Scale Your Outreach
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  🎯
                </div>
                Smart Lead Discovery
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Access millions of verified leads through Apollo API. Filter by job title,
                industry, company size, location, and more to find your ideal prospects.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  ✨
                </div>
                AI Email Generation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Generate highly personalized emails with GPT-4. Each email is tailored to
                the lead&apos;s background, role, and company for maximum impact.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  ⚡
                </div>
                Hybrid Automation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Set custom rules for auto-send or manual review. Let the system handle
                routine outreach while you focus on high-value prospects.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
                  📊
                </div>
                Rich Lead Profiles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                View comprehensive profiles with employment history, education, social
                profiles, company details, and engagement scores.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900 rounded-lg flex items-center justify-center">
                  📈
                </div>
                Campaign Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Track opens, clicks, replies, and conversions. Understand what works and
                optimize your campaigns for better results.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
                  🔒
                </div>
                Enterprise Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-base">
                Your data is secure with enterprise-grade authentication, encrypted
                connections, and compliance with industry standards.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <Card className="bg-primary text-primary-foreground">
          <CardContent className="p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">
              Ready to Transform Your Lead Generation?
            </h2>
            <p className="text-lg mb-8 opacity-90">
              Join hundreds of businesses already using LeadFlow to scale their outreach.
            </p>
            <Link href="/sign-up">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                Get Started Now
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>&copy; 2025 LeadFlow. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
