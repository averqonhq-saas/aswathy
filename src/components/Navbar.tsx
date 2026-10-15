"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
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
        "faq",
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

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const navLinks = [
    { label: "About", href: "/#about", id: "about" },
    { label: "Services", href: "/services", id: "services" },
    { label: "Gallery", href: "/gallery", id: "gallery" },
    { label: "My Approach", href: "/#my-approach", id: "my-approach" },
    { label: "Support & Inquiry", href: "/inquiry", id: "inquiry" },
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
          {/* Brand Title with Logo Icon */}
          <Link
            className="flex items-center gap-2.5 sm:gap-3 group text-left min-w-0"
            href="/"
          >
            <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden shrink-0 border border-parchment-border/60 shadow-xs bg-surface-container-low group-hover:scale-105 transition-transform duration-200">
              <Image
                src="/icon.png"
                alt="Aswathy Jeyarajasekar Logo - Counselling Psychologist"
                fill
                sizes="40px"
                className="object-contain p-0.5"
                priority
              />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-serif text-[14px] xs:text-[15px] sm:text-base md:text-lg text-primary tracking-tight font-medium transition-colors group-hover:text-primary-container leading-tight whitespace-nowrap">
                Aswathy Jeyarajasekar
              </span>
              <span className="font-label-caps text-on-surface-variant uppercase tracking-wider text-[8.5px] sm:text-[10px] leading-tight whitespace-nowrap mt-0.5">
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
        <div
          className="fixed inset-0 z-[90] md:hidden bg-black/50 backdrop-blur-sm animate-fadeIn"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="fixed top-0 right-0 bottom-0 z-[100] w-[86vw] max-w-[340px] bg-[#FCF9F2] shadow-[-15px_0_50px_rgba(28,28,24,0.3)] flex flex-col justify-between overflow-y-auto border-l border-parchment-border/80 p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-6">
              {/* Header inside mobile drawer */}
              <div className="flex items-center justify-between pb-4 border-b border-surface-container/80">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden shrink-0 border border-parchment-border/60 shadow-xs bg-surface-container-low">
                    <Image
                      src="/icon.png"
                      alt="Aswathy Jeyarajasekar Logo"
                      fill
                      sizes="32px"
                      className="object-contain p-0.5"
                    />
                  </div>
                  <div className="flex flex-col text-left min-w-0">
                    <span className="font-serif text-[13.5px] sm:text-sm font-semibold text-primary tracking-tight leading-tight whitespace-nowrap">
                      Aswathy Jeyarajasekar
                    </span>
                    <span className="text-[8.5px] sm:text-[9.5px] font-label-caps text-on-surface-variant uppercase tracking-wider leading-none mt-0.5 whitespace-nowrap">
                      Counselling Psychologist
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2.5 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container active:scale-95 transition-all cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <span className="text-[10px] font-label-caps uppercase tracking-widest text-secondary font-bold block mb-3 px-1">
                  Navigation
                </span>
                <nav className="flex flex-col space-y-1.5">
                  {navLinks.map((link) => (
                    <Link
                      key={link.id}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="px-4 py-3 rounded-2xl font-serif text-lg text-primary hover:text-forest-green hover:bg-surface-container/80 transition-all flex items-center justify-between group active:scale-[0.98]"
                    >
                      <span>{link.label}</span>
                      <ArrowRight className="w-4 h-4 text-secondary opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </nav>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-surface-container/80 shrink-0">
              <Link
                href="/book-a-session#booking-form"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-3.5 rounded-full bg-primary-container text-surface flex items-center justify-center gap-2 font-label-md text-xs font-semibold tracking-wider uppercase hover:bg-primary transition-all shadow-md active:scale-98"
              >
                <span>Book a Session</span>
                <span className="text-secondary-container">→</span>
              </Link>

              <p className="font-body-sm text-on-surface-variant text-center text-[11px] leading-relaxed">
                Safe, confidential & person-centered therapy
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
