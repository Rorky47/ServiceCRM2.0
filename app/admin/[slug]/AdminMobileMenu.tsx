"use client";

import { useState } from "react";
import Link from "next/link";

interface AdminMobileMenuProps {
  navItems: Array<{ href: string; label: string }>;
}

export default function AdminMobileMenu({ navItems }: AdminMobileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 text-gray-600 hover:text-gray-900 touch-manipulation"
        aria-label="Menu"
        aria-expanded={isOpen}
      >
        <svg
          className="w-6 h-6"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          {isOpen ? (
            <path d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>
      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed top-14 sm:top-16 right-0 bg-white border-l border-gray-200 shadow-lg z-50 w-64 max-h-[calc(100vh-3.5rem)] overflow-y-auto md:hidden">
            <nav className="flex flex-col py-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 text-sm font-medium border-b border-gray-100 last:border-0 touch-manipulation"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </>
      )}
    </>
  );
}
