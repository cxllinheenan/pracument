"use client"

import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Image from "next/image";
import { useRef } from "react";
import Link from "next/link"

export default function Home() {
  const featuresRef = useRef<HTMLElement>(null);

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation - Updated */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">Pracument</span>
            </div>
            <div className="hidden md:block">
              <div className="flex items-center space-x-4">
                <Button variant="ghost" onClick={scrollToFeatures}>
                  Features
                </Button>
                <Link href="/auth/signin">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="default">Sign Up</Button>
                </Link>
              </div>
            </div>
            <div className="md:hidden">
              <Drawer>
                <DrawerTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-6 w-6" />
                  </Button>
                </DrawerTrigger>
                <DrawerContent>
                  <DrawerHeader>
                    <DrawerTitle>Menu</DrawerTitle>
                  </DrawerHeader>
                  <div className="flex flex-col gap-2 p-4">
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start"
                      onClick={() => {
                        scrollToFeatures();
                        // You might want to add drawer close logic here
                      }}
                    >
                      Features
                    </Button>
                    <Link href="/auth/signin" className="w-full">
                      <Button variant="ghost" className="w-full justify-start">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup" className="w-full">
                      <Button variant="default" className="w-full">
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Enhanced with grid pattern */}
      <section className="relative py-20 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
          <div className="absolute inset-0 bg-primary/5 backdrop-blur-3xl" />
          <div className="absolute bottom-0 h-1/2 w-full bg-gradient-to-t from-background to-transparent" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-8">
            <div className="flex flex-col justify-center space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm text-primary w-fit animate-fade-in">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                </span>
                Now with AI-powered document analysis
              </div>
              <h1 className="text-4xl font-bold tracking-tight sm:text-6xl text-foreground animate-fade-in-up">
                Legal Document Management,{" "}
                <span className="text-primary relative">
                  Simplified
                  <span className="absolute bottom-0 left-0 w-full h-2 bg-primary/20 -z-10 transform -skew-x-12"></span>
                </span>
              </h1>
              <p className="text-lg text-muted-foreground animate-fade-in-up delay-100">
                Streamline your legal document workflow with AI-powered organization,
                intelligent search, and secure collaboration tools designed for modern
                legal teams.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-200">
                <Button size="lg" className="text-base relative overflow-hidden group">
                  <span className="relative z-10">Start Free Trial</span>
                  <div className="absolute inset-0 bg-primary-foreground/10 transform translate-y-full group-hover:translate-y-0 transition-transform"></div>
                </Button>
                <Button size="lg" variant="outline" className="text-base group">
                  <span>Book a Demo</span>
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </Button>
              </div>
              {/* Stats with enhanced design */}
              <div className="grid grid-cols-3 gap-4 pt-8 border-t border-border/40">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center transform hover:scale-105 transition-transform">
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
            {/* Enhanced Hero Image Section */}
            <div className="relative lg:mt-0">
              <div className="relative">
                <div className="aspect-[4/3] overflow-hidden rounded-xl bg-gradient-to-br from-primary/20 via-primary/5 to-background shadow-lg border border-border/50 transform hover:scale-[1.02] transition-transform">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px]" />
                  <Image
                    src="/dashboard-preview.png" // Add your dashboard preview image
                    alt="Pracument Dashboard"
                    fill
                    className="object-cover opacity-90"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 h-72 w-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Now with ref */}
      <section ref={featuresRef} className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why Legal Teams Choose Pracument
            </h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to manage your legal documents effectively
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-6 bg-background rounded-lg shadow-lg border border-border/50 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="text-primary mb-4 transform group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section - With working demo button */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-primary rounded-2xl p-8 sm:p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:24px_24px]" />
            <div className="relative z-10 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl font-bold text-white mb-4">
                Ready to Transform Your Legal Document Management?
              </h2>
              <p className="text-primary-foreground/90 mb-8">
                Join thousands of legal professionals who trust Pracument for their
                document management needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  variant="secondary"
                  className="text-primary hover:text-primary/90"
                >
                  Start Free Trial
                </Button>
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      size="lg"
                      variant="outline"
                      className="text-white border-white hover:bg-white/10"
                    >
                      Schedule Demo
                    </Button>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Schedule a Demo</SheetTitle>
                      <SheetDescription>
                        Book a personalized demo with our product specialists.
                      </SheetDescription>
                    </SheetHeader>
                    <div className="grid gap-4 py-4">
                      <div className="space-y-4">
                        <input
                          type="text"
                          placeholder="Your Name"
                          className="w-full p-2 rounded-md border border-border bg-background"
                        />
                        <input
                          type="email"
                          placeholder="Your Email"
                          className="w-full p-2 rounded-md border border-border bg-background"
                        />
                        <textarea
                          placeholder="Tell us about your needs"
                          className="w-full p-2 rounded-md border border-border bg-background h-24"
                        />
                        <Button className="w-full">Book Your Demo</Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 border-y border-border/40 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground mb-8">
            Trusted by leading law firms and legal departments
          </p>
          <div className="flex justify-center items-center gap-12 flex-wrap opacity-50">
            {/* Replace with actual company logos */}
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-8 w-32 bg-foreground/20 rounded" />
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16">
            Trusted by Legal Professionals
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div
                key={index}
                className="p-6 bg-secondary/30 rounded-lg border border-border/50"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="h-12 w-12 rounded-full bg-primary/20" />
                  <div>
                    <div className="font-semibold">{testimonial.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
                <p className="text-muted-foreground">{testimonial.quote}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-secondary/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="text-muted-foreground hover:text-primary">
                    Security
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Pracument. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}

const stats = [
  { value: "99.9%", label: "Uptime" },
  { value: "24/7", label: "Support" },
  { value: "10k+", label: "Customers" },
];

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Legal Director at Fortune 500",
    quote: "Pracument has revolutionized how we handle legal documents. The AI-powered search is a game-changer.",
  },
  {
    name: "Michael Chen",
    role: "Managing Partner",
    quote: "The collaboration features have made working with our international team seamless and efficient.",
  },
  {
    name: "Emily Rodriguez",
    role: "Corporate Counsel",
    quote: "Security and compliance were our top priorities, and Pracument exceeded our expectations.",
  },
];

const features = [
  {
    title: "AI-Powered Organization",
    description:
      "Automatically categorize and tag documents using advanced machine learning algorithms.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z"
        />
      </svg>
    ),
  },
  {
    title: "Secure Collaboration",
    description:
      "Share and collaborate on documents with team members while maintaining strict access controls.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        />
      </svg>
    ),
  },
  {
    title: "Smart Search",
    description:
      "Find any document instantly with our powerful search engine that understands legal terminology.",
    icon: (
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
    ),
  },
];
