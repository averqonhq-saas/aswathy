"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight } from "lucide-react";

interface NavbarProps {
  onOpenBooking?: (service?: string) => void;
}

export default function Navbar({ onOpenBooking }: NavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("about");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);

      const sections = [
        "about",
        "services",
        "my-approach",
        "journey",
        "expectations",
        "faq",
        "enquiry",
      ];
      const scrollPosition = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "About", href: "/#about", id: "about" },
    { label: "Services", href: "/#services", id: "services" },
    { label: "My Approach", href: "/#my-approach", id: "my-approach" },
    { label: "What to Expect", href: "/#expectations", id: "expectations" },
    { label: "Enquiry", href: "/#enquiry", id: "enquiry" },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-surface/90 backdrop-blur-md shadow-[0_4px_20px_rgba(65,42,30,0.08)] py-1"
            : "bg-surface/85 backdrop-blur-md shadow-[0_1px_8px_rgba(65,42,30,0.06)] py-0"
        }`}
      >
        <div className="h-20 max-w-container-max mx-auto px-gutter-mobile lg:px-gutter-desktop flex items-center justify-between">
          {/* Brand Logo & Title */}
          <Link
            className="flex items-center gap-space-sm group text-left"
            href="/"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              alt="Aswathy Logo"
              className="h-9 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
              src="/logo.svg"
            />
            <div className="flex flex-col">
              <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-medium transition-colors group-hover:text-primary-container">
                Aswathy Jeyarajasekar
              </span>
              <span className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-widest text-[10px]">
                Counselling Psychologist
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-space-xl">
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <Link
                  key={link.id}
                  href={link.href}
                  className={`font-label-caps text-label-caps tracking-widest uppercase transition-all duration-200 text-[11px] ${
                    isActive
                      ? "text-primary font-semibold underline underline-offset-8 decoration-secondary decoration-2"
                      : "text-on-surface-variant hover:text-primary hover:underline hover:underline-offset-8 hover:decoration-secondary-fixed-dim"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Header Action Buttons */}
          <div className="flex items-center gap-space-md">
            <Link
              href="/book-a-session#booking-form"
              className="hidden sm:inline-flex items-center justify-center px-space-lg py-space-xs rounded-full bg-primary-container text-surface hover:bg-primary transition-all duration-300 shadow-[0_8px_24px_-6px_rgba(244,210,66,0.35)] hover:shadow-[0_8px_24px_-4px_rgba(244,210,66,0.55)] group"
            >
              <span className="font-label-md text-label-md text-surface font-medium">
                Book a Session
              </span>
              <span className="ml-space-xxs text-secondary-container transition-transform duration-200 group-hover:translate-x-1">
                →
              </span>
            </Link>

            {/* Mobile menu hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-primary hover:bg-surface-container transition-colors cursor-pointer"
              aria-label="Toggle mobile menu"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden bg-tertiary/40 backdrop-blur-sm animate-fadeIn">
          <div className="fixed top-20 right-0 w-4/5 max-w-sm h-[calc(100vh-5rem)] bg-surface shadow-2xl p-space-xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-space-lg pt-space-md">
              <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary block">
                Navigation
              </span>
              <nav className="flex flex-col space-y-space-md">
                {navLinks.map((link) => (
                  <Link
                    key={link.id}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="font-headline-sm text-headline-sm text-primary hover:text-secondary transition-colors py-1 flex items-center justify-between border-b border-surface-container-high pb-2"
                  >
                    <span>{link.label}</span>
                    <ArrowRight className="w-4 h-4 text-secondary-fixed-dim" />
                  </Link>
                ))}
              </nav>
            </div>

            <div className="space-y-space-md pt-space-xl">
              <Link
                href="/book-a-session#booking-form"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-space-md rounded-full bg-primary-container text-surface flex items-center justify-center gap-space-xs font-label-md text-label-md font-semibold tracking-wide uppercase hover:bg-primary transition-all shadow-md"
              >
                <span>Book a Session</span>
                <span className="text-secondary-container">→</span>
              </Link>

              <p className="font-body-sm text-body-sm text-on-surface-variant text-center text-[12px]">
                Safe, confidential & person-centered therapy
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
