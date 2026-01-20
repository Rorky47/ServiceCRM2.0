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
    { href: `/admin/${params.slug}`, label: "Dashboard" },
    { href: `/admin/${params.slug}/pages`, label: "Pages" },
    { href: `/admin/${params.slug}/sections`, label: "Sections" },
    { href: `/admin/${params.slug}/media`, label: "Media" },
    { href: `/admin/${params.slug}/leads`, label: "Leads" },
    { href: `/admin/${params.slug}/settings`, label: "Settings" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Banner */}
      <div className="bg-yellow-400 text-black py-2 px-4 text-center font-semibold">
        🛠️ ADMIN MODE
      </div>

      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <h1 className="text-xl font-bold text-gray-900">{site.name} Admin</h1>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
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
            <div className="flex items-center">
              <Link
                href={`/site/${params.slug}?admin=true`}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View Site →
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}

