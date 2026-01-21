import { getSite } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";

interface AdminLayoutProps {
  children: React.ReactNode;
  params: { slug: string };
}

export default async function AdminLayout({ children, params }: AdminLayoutProps) {
  const site = await getSite(params.slug);
  if (!site) {
    notFound();
  }

  const navItems = [
    { href: `/admin/${params.slug}/dashboard`, label: "Dashboard" },
    { href: `/admin/${params.slug}/pages`, label: "Pages" },
    { href: `/admin/${params.slug}/sections`, label: "Sections" },
    { href: `/admin/${params.slug}/media`, label: "Media" },
    { href: `/admin/${params.slug}/leads`, label: "Leads" },
    { href: `/admin/${params.slug}/settings`, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Banner */}
      <div className="bg-yellow-400 text-black py-2 px-4 text-center font-semibold text-xs sm:text-sm">
        🛠️ ADMIN MODE
      </div>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14 sm:h-16">
            <div className="flex items-center flex-1">
              <div className="flex-shrink-0">
                <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">{site.name} Admin</h1>
              </div>
              <div className="hidden md:ml-6 md:flex md:space-x-6 lg:space-x-8">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <Link
                href={`/site/${params.slug}?admin=true`}
                className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm font-medium whitespace-nowrap"
              >
                <span className="hidden sm:inline">View Site →</span>
                <span className="sm:hidden">View →</span>
              </Link>
              <AdminMobileMenu navItems={navItems} />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-4 sm:py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

function AdminMobileMenu({ navItems }: { navItems: Array<{ href: string; label: string }> }) {
  "use client";
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden p-2 text-gray-600 hover:text-gray-900"
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
                  className="px-4 py-3 text-gray-700 hover:bg-gray-100 hover:text-gray-900 text-sm font-medium border-b border-gray-100 last:border-0"
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
}
