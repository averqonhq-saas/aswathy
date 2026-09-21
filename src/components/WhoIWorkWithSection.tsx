"use client";

import { useState, useEffect } from "react";

interface ClientGroup {
  id: string;
  icon: string;
  title: string;
  desc: string;
}

const defaultGroups: ClientGroup[] = [
  {
    id: "adolescents",
    icon: "face",
    title: "Adolescents",
    desc: "Navigating identity formation, academic stress, peer dynamics, emotional regulation, and family communication during formative teenage years.",
  },
  {
    id: "young-adults",
    icon: "explore",
    title: "Young Adults",
    desc: "Stepping into independence, career uncertainty, establishing healthy relationships, existential questioning, and managing life transitions.",
  },
  {
    id: "adults",
    icon: "person",
    title: "Adults",
    desc: "Addressing chronic burnout, emotional patterns, grief, life reprioritization, personal boundaries, and long-standing inner narratives.",
  },
  {
    id: "students",
    icon: "school",
    title: "Students",
    desc: "Exam anxiety, perfectionism, balancing demanding coursework, campus adjustments, and finding motivation without chronic overwhelm.",
  },
  {
    id: "professionals",
    icon: "work_outline",
    title: "Working Professionals",
    desc: "Workplace imposter syndrome, work-life balance, high-pressure environments, conflict resolution, and career pivot fatigue.",
  },
];

function getIconForTitle(title: string): string {
  const t = (title || "").toLowerCase();
  if (t.includes("adolescent") || t.includes("teen")) return "face";
  if (t.includes("young") || t.includes("youth")) return "explore";
  if (t.includes("student") || t.includes("academic")) return "school";
  if (
    t.includes("professional") ||
    t.includes("corporate") ||
    t.includes("work")
  )
    return "work_outline";
  if (t.includes("relationship") || t.includes("couple")) return "favorite";
  return "person";
}

export interface WhoIWorkWithSectionProps {
  initialGroups?: ClientGroup[];
}

export default function WhoIWorkWithSection({ initialGroups }: WhoIWorkWithSectionProps = {}) {
  const [groups, setGroups] = useState<ClientGroup[]>(initialGroups || defaultGroups);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);

  useEffect(() => {
    if (initialGroups && initialGroups.length > 0) return;

    let isMounted = true;
    async function loadClientTypes() {
      try {
        const res = await fetch("/api/content");
        if (!res.ok) return;
        const data = await res.json();
        if (
          isMounted &&
          data.clientTypes &&
          Array.isArray(data.clientTypes) &&
          data.clientTypes.length > 0
        ) {
          const mapped: ClientGroup[] = data.clientTypes.map((ct: any) => ({
            id: ct.id,
            icon: getIconForTitle(ct.title),
            title: ct.title,
            desc: ct.description,
          }));
          setGroups(mapped);
        }
      } catch (err) {
        console.error("Failed to load client types:", err);
      }
    }
    loadClientTypes();
    return () => {
      isMounted = false;
    };
  }, [initialGroups]);

  return (
    <section className="py-space-3xl lg:py-space-4xl bg-surface-container-low px-gutter-mobile lg:px-gutter-desktop">
      <div className="max-w-container-max mx-auto space-y-space-xl">
        <div className="text-center max-w-xl mx-auto space-y-space-xs">
          <span className="font-label-caps text-label-caps uppercase tracking-widest text-secondary block">
            Embracing Different Stages of Life
          </span>
          <h2 className="font-headline-xl text-headline-xl-mobile lg:text-headline-xl text-primary tracking-tight">
            Who I work with
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Providing a steady anchor through personal transitions, emotional
            hurdles, and self-discovery.
          </p>
        </div>

        {/* Demographic tags/cards */}
        <div className="flex flex-wrap justify-center gap-space-md max-w-4xl mx-auto pt-space-md">
          {groups.map((group) => {
            const isSelected = selectedGroup === group.id;
            return (
              <button
                key={group.id}
                onClick={() =>
                  setSelectedGroup(isSelected ? null : group.id)
                }
                className={`px-space-xl py-space-md rounded-2xl bg-surface shadow-sm hover:shadow-md transition-all duration-300 flex items-center gap-space-sm group cursor-pointer border ${
                  isSelected
                    ? "border-secondary-fixed ring-2 ring-secondary/20 bg-surface-container-lowest"
                    : "border-transparent"
                }`}
              >
                <span className="material-symbols-outlined text-secondary text-[22px]">
                  {group.icon}
                </span>
                <h3 className="font-headline-sm text-headline-sm text-primary group-hover:text-secondary transition-colors">
                  {group.title}
                </h3>
              </button>
            );
          })}
        </div>

        {/* Selected demographic interactive detail banner */}
        {selectedGroup && (
          <div className="max-w-2xl mx-auto p-space-lg rounded-2xl bg-surface border border-secondary-fixed/50 shadow-sm animate-fadeIn text-center space-y-space-xxs">
            <span className="font-label-caps text-label-caps uppercase tracking-wider text-secondary">
              Support Focus for {groups.find((g) => g.id === selectedGroup)?.title}
            </span>
            <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
              {groups.find((g) => g.id === selectedGroup)?.desc}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
