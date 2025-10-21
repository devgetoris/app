"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isSignIn = pathname === "/auth/sign-in";
  const isSignUp = pathname === "/auth/sign-up";

  return (
    <div className="min-h-screen flex relative">
      {/* Navigation Buttons - Top Right */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        {!isSignIn && (
          <Link href="/auth/sign-in">
            <Button variant="ghost" size="sm">
              Sign In
            </Button>
          </Link>
        )}
        {!isSignUp && (
          <Link href="/auth/sign-up">
            <Button variant="outline" size="sm">
              Sign Up
            </Button>
          </Link>
        )}
      </div>

      {/* Left Section - Branding */}
      <div className="hidden lg:flex lg:w-3/5 relative font-['Poppins']">
        {/* Background Video */}
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        >
          <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/alt-g7Cv2QzqL3k6ey3igjNYkM32d8Fld7.mp4" type="video/mp4" />
        </video>
        
        {/* Black overlay */}
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Logo - Top Left */}
        <div className="absolute top-12 left-12 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">O</span>
            </div>
            <span className="text-2xl font-bold text-primary">Oris AI</span>
          </div>
        </div>

        {/* Testimonial - Bottom Left */}
        <div className="absolute bottom-12 left-12 z-10">
          <div className="space-y-4">
            <blockquote className="text-lg text-slate-300 italic">
              "Oris AI transformed our outreach process. We went from spending hours researching leads and writing emails to generating personalized, high-converting messages in seconds. Our response rates increased by 3x."
            </blockquote>
            <div className="text-sm text-slate-400">
              — Sarah Chen, Growth Lead
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Auth Form */}
      <div className="flex-1 lg:w-2/5 bg-background flex items-center justify-center p-8 font-['Poppins']">
        <div className="w-full max-w-md space-y-8">
          {children}
        </div>
      </div>
    </div>
  );
}
