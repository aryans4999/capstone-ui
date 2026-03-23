import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  ShieldCheck,
  TrendingUp,
  FileText,
  Bell,
  BarChart3,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default async function HomePage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground hidden sm:inline">
              Aeviox AI
            </span>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            {userId ? (
              <div className="flex items-center gap-3">
                <Link href="/dashboard/profile">
                  <Button variant="outline" size="sm">
                    Dashboard
                  </Button>
                </Link>
                <Link href="/admin/dashboard/claims">
                  <Button variant="outline" size="sm">
                    Admin Dashboard
                  </Button>
                </Link>
                <UserButton afterSignOutUrl="/" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <SignInButton mode="modal">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button size="sm">Sign Up</Button>
                </SignUpButton>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-16 sm:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto text-center space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground text-balance">
              AI-Powered Smart Car Insurance Claims
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground text-balance">
              Fast, paperless, and AI-assisted claims processing. Get your
              claims approved in minutes, not days.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
              {userId ? (
                <Link href="/dashboard/claims">
                  <Button size="lg" className="gap-2">
                    Go to Dashboard
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <>
                  <SignUpButton mode="modal">
                    <Button size="lg" className="gap-2">
                      Get Started
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </SignUpButton>
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-muted">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Why Choose Aeviox AI?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience the future of insurance claims with intelligent
              automation and customer-first service.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <Card className="p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">
                AI Claim Assistant
              </h3>
              <p className="text-muted-foreground">
                Intelligent assistant guides you through the entire claims
                process step by step.
              </p>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">
                Real-Time Tracking
              </h3>
              <p className="text-muted-foreground">
                Monitor your claim status in real-time with detailed progress
                updates and notifications.
              </p>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <FileText className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">
                Secure Document Management
              </h3>
              <p className="text-muted-foreground">
                Encrypted storage and easy upload of accident photos, police
                reports, and evidence.
              </p>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <Bell className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">
                Smart Notifications
              </h3>
              <p className="text-muted-foreground">
                Stay informed with timely alerts on claim updates, approvals,
                and action items.
              </p>
            </Card>

            {/* Feature 5 */}
            <Card className="p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">
                Policy & Vehicle Overview
              </h3>
              <p className="text-muted-foreground">
                View all your policies, vehicle information, and claim history
                in one place.
              </p>
            </Card>

            {/* Feature 6 */}
            <Card className="p-6 flex flex-col gap-4 hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-accent" />
              </div>
              <h3 className="font-semibold text-lg text-foreground">
                Military-Grade Security
              </h3>
              <p className="text-muted-foreground">
                Your data is protected with enterprise-level encryption and
                compliance standards.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Ready to file your claim?
          </h2>
          <p className="text-lg opacity-90 max-w-xl mx-auto">
            Join thousands of users who have already experienced faster, smarter
            insurance claims.
          </p>
          {!userId && (
            <SignUpButton mode="modal">
              <Button size="lg" variant="secondary" className="gap-2">
                Get Started Today
                <ArrowRight className="w-4 h-4" />
              </Button>
            </SignUpButton>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-primary flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">Aeviox AI</span>
            </div>
            <p className="text-muted-foreground text-sm">
              © 2026 Aeviox AI. Revolutionizing insurance claims with artificial
              intelligence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
