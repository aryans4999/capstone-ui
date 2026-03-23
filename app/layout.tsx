import type React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { ClerkProvider } from "@clerk/nextjs";
import { ThemeProvider } from "@/components/theme-provider";
import { ErrorBoundary } from "@/components/error-boundary";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Aeviox AI – Smart Car Insurance Claims",
  description: "AI-Powered Smart Car Insurance Claims Platform",
  generator: "v0.app",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 5,
  },
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const publishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ErrorBoundary>
            {publishableKey ? (
              <ClerkProvider>{children}</ClerkProvider>
            ) : (
              <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
                <div className="text-center space-y-4">
                  <h1 className="text-2xl font-bold">Configuration Required</h1>
                  <p className="text-muted-foreground max-w-md">
                    Please add your Clerk publishable key to your environment
                    variables.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Get your key at:{" "}
                    <a
                      href="https://dashboard.clerk.com/last-active?path=api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Clerk API Keys
                    </a>
                  </p>
                  <code className="block bg-muted p-3 rounded text-xs mt-4">
                    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key_here
                  </code>
                </div>
              </div>
            )}
          </ErrorBoundary>
          <Toaster />
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
