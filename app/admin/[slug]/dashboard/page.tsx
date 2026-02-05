import { getSite, getAllPages, getLeads } from "@/lib/data";
import Link from "next/link";

interface DashboardProps {
  params: { slug: string };
}

export default async function AdminDashboard({ params }: DashboardProps) {
  const site = await getSite(params.slug);
  const pages = await getAllPages(params.slug);
  const leads = await getLeads(params.slug, 10, 0);

  if (!site) {
    return <div>Site not found</div>;
  }

  return (
    <div className="px-4 py-4 sm:py-6 sm:px-0">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">Manage your site: {site.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3 mb-8">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">📄</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Pages</dt>
                  <dd className="text-lg font-medium text-gray-900">{pages.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">📧</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Leads</dt>
                  <dd className="text-lg font-medium text-gray-900">{leads.length}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-3xl">🌐</span>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Domains</dt>
                  <dd className="text-lg font-medium text-gray-900">{site.domains?.length || 0}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white shadow rounded-lg mb-8">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href={`/admin/${params.slug}/pages?action=add`}
              className="relative rounded-lg border border-gray-300 bg-white px-4 py-4 sm:px-6 sm:py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 touch-manipulation min-h-[60px]"
            >
              <div className="flex-shrink-0">
                <span className="text-2xl">➕</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Add New Page</p>
                <p className="text-sm text-gray-500 truncate">Create a new page</p>
              </div>
            </Link>

            <Link
              href={`/site/${params.slug}?admin=true`}
              className="relative rounded-lg border border-gray-300 bg-white px-4 py-4 sm:px-6 sm:py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 touch-manipulation min-h-[60px]"
            >
              <div className="flex-shrink-0">
                <span className="text-2xl">✏️</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Edit Site</p>
                <p className="text-sm text-gray-500 truncate">Edit content inline</p>
              </div>
            </Link>

            <Link
              href={`/admin/${params.slug}/settings`}
              className="relative rounded-lg border border-gray-300 bg-white px-4 py-4 sm:px-6 sm:py-5 shadow-sm flex items-center space-x-3 hover:border-gray-400 focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500 touch-manipulation min-h-[60px]"
            >
              <div className="flex-shrink-0">
                <span className="text-2xl">⚙️</span>
              </div>
              <div className="flex-1 min-w-0">
                <span className="absolute inset-0" aria-hidden="true" />
                <p className="text-sm font-medium text-gray-900">Site Settings</p>
                <p className="text-sm text-gray-500 truncate">Configure theme & SEO</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Leads */}
      {leads.length > 0 && (
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg leading-6 font-medium text-gray-900">Recent Leads</h3>
              <Link
                href={`/admin/${params.slug}/leads`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-4">
              {leads.slice(0, 5).map((lead) => (
                <div key={lead.id} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{lead.name}</p>
                      <p className="text-sm text-gray-500">{lead.email}</p>
                    </div>
                    <p className="text-xs text-gray-400">
                      {new Date(lead.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-gray-700 line-clamp-2">{lead.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

