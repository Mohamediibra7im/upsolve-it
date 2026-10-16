import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import StudioMascot from "@/components/shared/StudioMascot";

export default function NotFound() {
 return <main id="main-content" className="flex min-h-dvh items-center justify-center px-5 py-16"><section className="w-full max-w-lg rounded-3xl border border-border bg-card px-7 py-10 text-center sm:px-12"><StudioMascot pose="think" className="mx-auto mb-3 w-40" /><p className="mb-3 text-sm font-medium text-primary">404 / Page not found</p><h1 className="font-heading text-4xl font-medium tracking-tight">A small detour.</h1><p className="mt-5 text-sm leading-7 text-muted-foreground">This page has moved or doesn’t exist. Let’s get you back to your next challenge.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><Button asChild className="h-11 rounded-xl"><Link href="/"><Home size={16} />Go to home</Link></Button><Button asChild variant="outline" className="h-11 rounded-xl"><Link href="/help"><ArrowLeft size={16} />Visit help center</Link></Button></div></section></main>;
}
