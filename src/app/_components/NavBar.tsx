"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  {
    href: "/requests",
    label: "Requests",
    // Active on the list and on detail pages, but not on the "new" form.
    isActive: (path: string) =>
      path === "/requests" ||
      (path.startsWith("/requests/") && path !== "/requests/new"),
  },
  {
    href: "/requests/new",
    label: "New request",
    isActive: (path: string) => path === "/requests/new",
  },
];

export const NavBar = () => {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4 sm:px-8">
        <Link href="/requests" className="text-lg font-semibold tracking-tight">
          Mini<span className="text-sky-600">Rx</span>
        </Link>

        <ul className="flex items-center gap-1">
          {links.map(({ href, label, isActive }) => {
            const active = isActive(pathname);
            return (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-sky-50 text-sky-700"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
};
