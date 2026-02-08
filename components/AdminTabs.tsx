"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminTabs() {
  const pathname = usePathname();

  const tabs = [
    { href: "/admin/users", label: "Users" },
    { href: "/admin/symptoms", label: "Symptoms" },
    { href: "/admin/outcomes", label: "Outcomes" },
    { href: "/admin/rules", label: "Rules" },
  ];

  const isActive = (href: string) => pathname?.startsWith(href);

  return (
    <div className="mb-6 border-b border-slate-200">
      <nav className="-mb-px flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              isActive(tab.href)
                ? "border-blue-600 text-blue-700"
                : "border-transparent text-slate-600 hover:text-slate-800 hover:border-slate-300"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

