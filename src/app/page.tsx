import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HeartPulse, Users, BarChart, Brain } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <Link href="/" className="flex items-center space-x-2 text-lg font-semibold text-primary">
            <HeartPulse className="h-7 w-7" />
            <span>ReNutri</span>
          </Link>
          <nav className="ml-auto flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-secondary/50">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none text-primary">
                    Intelligent Nutrition, Personalized For You
                  </h1>
                  <p className="max-w-[600px] text-foreground/80 md:text-xl">
                    ReNutri empowers nutritionists with AI-driven tools for comprehensive patient management, anthropometric tracking, and personalized macronutrient recommendations.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button size="lg" asChild>
                    <Link href="/dashboard">
                      Access Dashboard
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <Link href="#features">
                      Learn More
                    </Link>
                  </Button>
                </div>
              </div>
              <Image
                src="https://picsum.photos/seed/renutri-hero/600/400"
                alt="Nutritionist working with charts"
                width={600}
                height={400}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square shadow-lg"
                data-ai-hint="healthy food charts"
              />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm text-secondary-foreground">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Streamline Your Nutritional Practice</h2>
                <p className="max-w-[900px] text-foreground/80 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  ReNutri offers a suite of tools designed to enhance patient care and optimize nutritional planning.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <Users className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Patient Registration</CardTitle>
                  <CardDescription>Easily add and manage patient records with all key data in one place.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <BarChart className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>Anthropometric Assessment</CardTitle>
                  <CardDescription>Track measurements, calculate BMI, and monitor progress with visual charts.</CardDescription>
                </CardHeader>
              </Card>
              <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 text-primary"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M15.5 8.5c0 .83-.67 1.5-1.5 1.5s-1.5-.67-1.5-1.5.67-1.5 1.5-1.5.5.25.5.5M8.5 8.5c0 .83.67 1.5 1.5 1.5s1.5-.67 1.5-1.5S10.83 7 10 7s-.5.25-.5.5"/><path d="M15.55 14.57a3.499 3.499 0 0 0-7.1 0"/></svg>
                  <CardTitle>Food Assessment</CardTitle>
                  <CardDescription>Record eating habits and food preferences for tailored nutritional plans.</CardDescription>
                </CardHeader>
              </Card>
               <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <Brain className="h-10 w-10 mb-2 text-primary" />
                  <CardTitle>AI Macronutrient Plans</CardTitle>
                  <CardDescription>Generate personalized macronutrient recommendations using AI.</CardDescription>
                </CardHeader>
              </Card>
               <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
                <CardHeader className="pb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mb-2 text-primary"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                  <CardTitle>Progress Visualization</CardTitle>
                  <CardDescription>Display patient progress with downloadable charts for clear insights.</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background">
        <div className="container flex flex-col items-center justify-between gap-4 py-10 md:h-24 md:flex-row md:py-0">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} ReNutri. All rights reserved.
          </p>
          <p className="text-sm text-muted-foreground">
            Built with Next.js and Firebase Studio.
          </p>
        </div>
      </footer>
    </div>
  );
}
