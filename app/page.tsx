"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  IconSchool,
  IconUserCheck,
  IconBook2,
  IconFileText,
  IconArrowRight,
  IconLayoutDashboard,
  IconTrendingUp,
  IconShield,
  IconDeviceLaptop,
  IconBrandFacebook,
  IconBrandTwitter,
  IconBrandInstagram,
  IconBrandLinkedin,
  IconArrowUp,
} from "@tabler/icons-react";

export default function Home() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground relative overflow-hidden font-sans" suppressHydrationWarning>
      {/* Background Decorative Waves & Glows (Matches custom wave theme) */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-gradient-to-tr from-sky-50/50 via-white to-sky-100/30 dark:from-slate-950 dark:via-background dark:to-slate-900">

        {/* Soft upper left glow */}
        <div className="absolute top-[-20%] left-[-10%] w-[60vw] h-[60vw] rounded-full bg-primary/5 blur-[140px] animate-pulse-subtle" />

        {/* SVG Waves and Curves Mesh (Bolder for high visibility) */}
        <svg className="absolute w-full h-full min-w-[1024px] opacity-90 dark:opacity-40" viewBox="0 0 1440 800" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <linearGradient id="wave-grad-1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#2563eb" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.03" />
            </linearGradient>
            <linearGradient id="wave-grad-2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.18" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.06" />
            </linearGradient>
            <linearGradient id="line-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0" />
              <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#2563eb" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Abstract Wave Shapes */}
          <path d="M-100 500 C 300 350, 500 650, 900 500 C 1200 400, 1300 550, 1600 450 L1600 900 L-100 900 Z" fill="url(#wave-grad-1)" />
          <path d="M-100 550 C 200 480, 450 400, 800 580 C 1100 700, 1300 500, 1600 600 L1600 900 L-100 900 Z" fill="url(#wave-grad-2)" opacity="0.75" />
          <path d="M-100 420 C 400 300, 600 700, 1100 550 C 1300 480, 1400 600, 1600 500 L1600 900 L-100 900 Z" fill="none" stroke="url(#line-grad)" strokeWidth="4.5" />

          {/* Thin curved lines mesh on the right */}
          {Array.from({ length: 15 }).map((_, i) => {
            const offset = i * 22;
            const opacity = 0.08 + (i * 0.018);
            return (
              <path
                key={i}
                d={`M 800 ${800 + offset} C 1100 ${500 - offset}, 1200 ${300 + offset}, 1500 ${100 - offset}`}
                fill="none"
                stroke="var(--primary)"
                strokeWidth="1.5"
                opacity={opacity}
              />
            );
          })}

          {/* Secondary crossing mesh lines */}
          {Array.from({ length: 10 }).map((_, i) => {
            const offset = i * 32;
            const opacity = 0.06 + (i * 0.012);
            return (
              <path
                key={`cross-${i}`}
                d={`M 900 ${800 - offset} C 1200 ${600 - offset}, 1300 ${200 + offset}, 1600 ${50 - offset}`}
                fill="none"
                stroke="#60a5fa"
                strokeWidth="1.0"
                opacity={opacity}
              />
            );
          })}
        </svg>

        {/* Subtle grid layout underlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      {/* Floating Header */}
      <div className="sticky top-0 z-50 w-full flex justify-center pointer-events-none transition-all duration-500 ease-in-out">
        <header
          className={`w-[92%] sm:w-[96%] max-w-7xl pointer-events-auto transition-all duration-500 ease-in-out p-[1.5px] rounded-2xl bg-gradient-to-r ${
            scrolled
              ? "mt-2 from-border/80 via-primary/35 to-border/80 shadow-lg shadow-primary/5"
              : "mt-4 from-border/25 via-primary/15 to-border/25 shadow-sm"
          }`}
        >
          <div
            className={`w-full h-full rounded-[15px] px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-all duration-500 ease-in-out ${
              scrolled
                ? "bg-background/90 backdrop-blur-xl h-16"
                : "bg-background/40 backdrop-blur-md h-20"
            }`}
          >
            {/* Logo Group */}
            <a href="#" className="flex items-center gap-3 group transition-transform duration-300 hover:scale-[1.01]">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-primary/30 shadow-inner group-hover:border-primary/50 transition-all duration-300 bg-background flex items-center justify-center p-0.5">
                <Image
                  src="/resources/avatar/nk.png"
                  alt="NK ONE School"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-transform duration-300"
                  priority
                />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base sm:text-lg tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-primary bg-clip-text text-transparent group-hover:text-primary transition-colors duration-300">
                  NK ONE School
                </span>
                <span className="text-[9px] sm:text-[10px] text-muted-foreground font-semibold uppercase tracking-wider -mt-1 select-none">
                  System Management School
                </span>
              </div>
            </a>



            {/* Action Buttons */}
            <div className="flex items-center gap-2 sm:gap-3">
              <a
                href="/login"
                className="text-xs sm:text-sm font-semibold text-muted-foreground hover:text-foreground transition-all duration-300 px-3.5 sm:px-4 py-2 rounded-xl hover:bg-accent/40 active:scale-[0.98]"
              >
                Sign In
              </a>
              <a
                href="/signup"
                className="text-xs sm:text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-all duration-300 shadow-md shadow-primary/10 hover:shadow-lg hover:shadow-primary/20 active:scale-[0.98] px-4.5 sm:px-5 py-2.5 rounded-xl border border-primary/10 flex items-center gap-1.5 hover:scale-[1.02] group/btn cursor-pointer"
              >
                Register
                <IconArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
              </a>
            </div>
          </div>
        </header>
      </div>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col py-16 md:py-24 relative z-10 space-y-24 md:space-y-32">

        {/* Main Hero grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left Column (Hero Content) */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">

            <div className="space-y-4">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1] bg-gradient-to-b from-foreground via-foreground to-foreground/75 bg-clip-text text-transparent">
                NK ONE School
              </h1>
              <p className="text-lg md:text-xl text-primary font-semibold tracking-wide uppercase">
                Admin Management & Learning System
              </p>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-xl">
                A premium, high-performance portal designed to organize branches, track student academic performance, manage employee logs, and facilitate internal communication.
              </p>
            </div>
          </div>

          {/* Right Column (Hero Graphics & Interactive Mockups) */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center relative">

            {/* Main Interactive Glassmorphic Panel */}
            <div className="relative w-full max-w-[500px] group transition-all duration-500 hover:scale-[1.015] hover:shadow-primary/5">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-primary/25 to-primary/0 blur-2xl opacity-75 group-hover:opacity-90 transition-opacity duration-500" />

              {/* Backing Card (Logo view) */}
              <div className="relative bg-gradient-to-b from-card/85 to-card/50 backdrop-blur-xl border border-border/60 p-6 rounded-3xl shadow-2xl flex flex-col gap-6 overflow-hidden">
                {/* Decorative Internal Glass Glows */}
                <div className="absolute -top-16 -right-16 w-32 h-32 rounded-full bg-primary/10 blur-2xl pointer-events-none" />
                <div className="absolute -bottom-16 -left-16 w-32 h-32 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

                {/* School Logo Section (With glare effect) */}
                <div className="relative overflow-hidden bg-gradient-to-br from-background to-muted/80 border border-border/45 p-6 rounded-2xl flex items-center justify-center shadow-inner group/logo">
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/logo:translate-x-[100%] transition-transform duration-1000 ease-in-out pointer-events-none" />
                  <Image
                    src="/resources/avatar/nk.png"
                    alt="NK ONE Logo"
                    width={220}
                    height={220}
                    className="w-auto h-auto max-w-[160px] md:max-w-[200px] rounded-2xl drop-shadow-sm transition-transform duration-500 group-hover/logo:scale-[1.02]"
                    priority
                  />
                </div>

                {/* Dashboard Mockup Preview Inside Card */}
                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Live System Overview</span>
                    <span className="inline-flex items-center gap-1.5 text-[10px] bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Portal
                    </span>
                  </div>

                  {/* Tiny Stats Row */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-background/50 hover:bg-background/80 border border-border/40 hover:border-primary/25 p-3 rounded-xl flex flex-col space-y-1 transition-all duration-300 hover:scale-[1.03] hover:shadow-sm">
                      <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Students</span>
                      <span className="text-sm font-extrabold text-foreground">1,248</span>
                      <span className="text-[8px] text-emerald-500 font-semibold flex items-center gap-0.5">
                        <IconTrendingUp className="w-2.5 h-2.5" /> +12%
                      </span>
                    </div>
                    <div className="bg-background/50 hover:bg-background/80 border border-border/40 hover:border-primary/25 p-3 rounded-xl flex flex-col space-y-1 transition-all duration-300 hover:scale-[1.03] hover:shadow-sm">
                      <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Teachers</span>
                      <span className="text-sm font-extrabold text-foreground">142</span>
                      <span className="text-[8px] text-primary font-semibold">9 Departments</span>
                    </div>
                    <div className="bg-background/50 hover:bg-background/80 border border-border/40 hover:border-primary/25 p-3 rounded-xl flex flex-col space-y-1 transition-all duration-300 hover:scale-[1.03] hover:shadow-sm">
                      <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">Branches</span>
                      <span className="text-sm font-extrabold text-foreground">12</span>
                      <span className="text-[8px] text-amber-500 font-semibold">2 Pending</span>
                    </div>
                  </div>

                  {/* Tiny Status Bar / Activity Mockup */}
                  <div className="bg-background/50 hover:bg-background/80 border border-border/40 hover:border-primary/25 p-3.5 rounded-xl flex items-center gap-3 transition-all duration-300 hover:scale-[1.01] hover:shadow-sm">
                    <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 shadow-inner">
                      <IconFileText className="w-4.5 h-4.5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-foreground truncate">Quarterly Academic Progress Reports</p>
                      <p className="text-[9px] text-muted-foreground truncate">Generated and published 412 reports</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20 shrink-0">100%</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>


        {/* Features Highlights Grid */}
        <div id="features" className="space-y-12 scroll-mt-24">
          <div className="text-center max-w-2xl mx-auto space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Powerful Core Capabilities
            </h2>
            <p className="text-muted-foreground">
              Everything you need to handle complex, multi-branch educational platforms in a single, beautiful system.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">

            {/* Card 1 */}
            <div className="group bg-card/45 backdrop-blur-sm border border-border/40 p-8 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <IconSchool className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:animate-school-bounce" />
              </div>
              <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                School Administration
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Organize and scale school configurations dynamically. Manage multiple branches, grades, subjects, and customized levels.
              </p>
            </div>

            {/* Card 2 */}
            <div className="group bg-card/45 backdrop-blur-sm border border-border/40 p-8 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <IconUserCheck className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:scale-110 group-hover:translate-y-[-1px]" />
              </div>
              <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                Student & Teacher Portals
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Maintain structured records of student information, parent contacts, demographic data, and employee service profiles.
              </p>
            </div>

            {/* Card 3 */}
            <div className="group bg-card/45 backdrop-blur-sm border border-border/40 p-8 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all duration-300 flex flex-col space-y-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/15 group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                <IconBook2 className="w-6 h-6 text-primary group-hover:text-primary-foreground transition-all duration-300 group-hover:animate-book-flip" />
              </div>
              <h3 className="text-lg font-bold group-hover:text-primary transition-colors">
                Academic Progress Reports
              </h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Record scoring metrics, log student behavior, and automatically generate comprehensive, publishable academic progress reports.
              </p>
            </div>

          </div>
        </div>

        {/* Detailed Showcase Section */}
        <div id="about" className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center scroll-mt-24">

          {/* Left Graphic (Feature Showcase Card) */}
          <div className="lg:col-span-5 order-last lg:order-first relative flex justify-center">
            <div className="absolute inset-0 bg-primary/5 rounded-3xl blur-2xl pointer-events-none" />
            <div className="relative bg-card/45 backdrop-blur-md border border-border/40 p-6 rounded-2xl shadow-xl w-full max-w-[400px] flex flex-col space-y-6">
              <div className="flex items-center justify-between border-b border-border/40 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-[10px] text-muted-foreground font-mono">system-settings.conf</span>
              </div>

              <ul className="space-y-4">
                <li className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold">Multi-Tenant Isolation</p>
                    <p className="text-[10px] text-muted-foreground">Each school runs securely within its own data namespace.</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold">Fast Data Imports / Exports</p>
                    <p className="text-[10px] text-muted-foreground">Easily load student/teacher lists and generate reports in Excel.</p>
                  </div>
                </li>
                <li className="flex gap-3 items-start">
                  <div className="w-5 h-5 rounded bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                    ✓
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-semibold">Role-Based Access Control</p>
                    <p className="text-[10px] text-muted-foreground">Define explicit limits for Super Admins, School Admins, and Staff.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column (Feature Showcase Details) */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight leading-tight">
              Enterprise Grade Operations, Simplified.
            </h2>
            <p className="text-muted-foreground text-base md:text-lg">
              Designed from the ground up to support administrators in managing educational branches, handling secure operations, and scaling records without database bottlenecking or performance lags.
            </p>
            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto lg:mx-0 pt-2">
              <div className="bg-card/30 border border-border/30 p-4 rounded-xl flex items-center gap-3">
                <IconShield className="w-5 h-5 text-primary shrink-0" />
                <span className="text-xs font-bold">Secure SSL / RBAC</span>
              </div>
              <div className="bg-card/30 border border-border/30 p-4 rounded-xl flex items-center gap-3">
                <IconDeviceLaptop className="w-5 h-5 text-primary shrink-0" />
                <span className="text-xs font-bold">Responsive Web Portal</span>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-border/30 bg-card/25 backdrop-blur-md relative z-10 pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-8 pb-12">
            
            {/* Left Brand Column (5 Cols) */}
            <div className="md:col-span-5 flex flex-col space-y-4">
              <a href="#" className="flex items-center gap-3 group w-fit">
                <div className="w-9 h-9 rounded-lg overflow-hidden border border-primary/20 bg-background flex items-center justify-center p-0.5">
                  <Image
                    src="/resources/avatar/nk.png"
                    alt="NK ONE School"
                    width={36}
                    height={36}
                    className="w-full h-full object-cover rounded-md group-hover:scale-105 transition-transform"
                  />
                </div>
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  NK ONE School
                </span>
              </a>
              <p className="text-xs text-muted-foreground leading-relaxed max-w-sm">
                A premium, high-performance portal designed to organize branches, track student academic performance, manage employee logs, and facilitate internal communication.
              </p>
              
              {/* Social icons */}
              <div className="flex items-center gap-3 pt-2">
                <a href="#" className="w-8 h-8 rounded-lg bg-background border border-border/40 hover:border-primary/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 shadow-sm active:scale-95">
                  <IconBrandFacebook className="w-4.5 h-4.5" />
                </a>
                <a href="#" className="w-8 h-8 rounded-lg bg-background border border-border/40 hover:border-primary/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 shadow-sm active:scale-95">
                  <IconBrandTwitter className="w-4.5 h-4.5" />
                </a>
                <a href="#" className="w-8 h-8 rounded-lg bg-background border border-border/40 hover:border-primary/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 shadow-sm active:scale-95">
                  <IconBrandInstagram className="w-4.5 h-4.5" />
                </a>
                <a href="#" className="w-8 h-8 rounded-lg bg-background border border-border/40 hover:border-primary/30 flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/5 transition-all duration-300 shadow-sm active:scale-95">
                  <IconBrandLinkedin className="w-4.5 h-4.5" />
                </a>
              </div>
            </div>

            {/* Column 2 (Portal Links - 2 Cols) */}
            <div className="md:col-span-2 flex flex-col space-y-3.5">
              <span className="text-xs font-bold text-foreground uppercase tracking-widest">Portal</span>
              <ul className="space-y-2 text-xs">
                <li><a href="/login" className="text-muted-foreground hover:text-primary transition-colors">Sign In</a></li>
                <li><a href="/signup" className="text-muted-foreground hover:text-primary transition-colors">Register</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Portal Overview</a></li>
              </ul>
            </div>

            {/* Column 3 (Solutions - 2 Cols) */}
            <div className="md:col-span-2 flex flex-col space-y-3.5">
              <span className="text-xs font-bold text-foreground uppercase tracking-widest">Solutions</span>
              <ul className="space-y-2 text-xs">
                <li><a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Core Features</a></li>
                <li><a href="#about" className="text-muted-foreground hover:text-primary transition-colors">Role Management</a></li>
                <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors">Academic Reporting</a></li>
              </ul>
            </div>

            {/* Column 4 (Support & Legal - 3 Cols) */}
            <div className="md:col-span-3 flex flex-col space-y-3.5">
              <span className="text-xs font-bold text-foreground uppercase tracking-widest">Support</span>
              <ul className="space-y-2 text-xs">
                <li><a href="/dashboard/help" className="text-muted-foreground hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="/dashboard/feedback" className="text-muted-foreground hover:text-primary transition-colors">System Feedback</a></li>
                <li><a href="/dashboard/privacy" className="text-muted-foreground hover:text-primary transition-colors">Privacy Policy</a></li>
                <li><a href="/dashboard/terms" className="text-muted-foreground hover:text-primary transition-colors">Terms of Service</a></li>
              </ul>
            </div>

          </div>

          {/* Divider */}
          <div className="h-px bg-border/40 my-6" />

          {/* Bottom Copyright Row */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-[11px] text-muted-foreground text-center sm:text-left">
              © {new Date().getFullYear()} NK ONE School. All rights reserved.
            </p>
            
            {/* Scroll back to top */}
            <button 
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground hover:text-primary transition-colors cursor-pointer"
            >
              Back to Top
              <span className="w-6 h-6 rounded-md bg-background border border-border/40 hover:border-primary/20 flex items-center justify-center group-hover:-translate-y-0.5 transition-transform duration-300">
                <IconArrowUp className="w-3 h-3 text-muted-foreground group-hover:text-primary transition-colors" />
              </span>
            </button>
          </div>

        </div>
      </footer>
    </div>
  );
}
