import { getLeads, getSite } from "@/lib/data";
import { notFound } from "next/navigation";
import Link from "next/link";

const PAGE_SIZE = 20;

interface PageProps {
  params: { slug: string };
  searchParams?: { page?: string };
}

export default async function LeadsPage({ params, searchParams }: PageProps) {
  const site = await getSite(params.slug);
  if (!site) {
    notFound();
  }

  const page = Math.max(1, parseInt(searchParams?.page ?? "1", 10) || 1);
  const offset = (page - 1) * PAGE_SIZE;
  const leads = await getLeads(params.slug, PAGE_SIZE, offset);
  const hasMore = leads.length === PAGE_SIZE;
  const hasPrev = page > 1;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Leads for {site.name}</h1>
          <a href={`/site/${params.slug}?admin=true`} className="text-blue-600 underline">
            ← Back to Site
          </a>
        </div>
        {leads.length === 0 && !hasPrev ? (
          <p className="text-gray-500">No leads yet.</p>
        ) : (
          <>
            <div className="space-y-4">
              {leads.map((lead) => (
                <div key={lead.id} className="bg-white p-6 rounded-lg shadow">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-semibold text-lg">{lead.name}</h3>
                      <p className="text-gray-600">{lead.email}</p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(lead.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-gray-700 mt-2">{lead.message}</p>
                </div>
              ))}
            </div>
            {(hasPrev || hasMore) && (
              <div className="mt-6 flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  Page {page}
                  {hasMore && " (more may follow)"}
                </span>
                <div className="flex gap-2">
                  {hasPrev && (
                    <Link
                      href={`/admin/${params.slug}/leads?page=${page - 1}`}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Previous
                    </Link>
                  )}
                  {hasMore && (
                    <Link
                      href={`/admin/${params.slug}/leads?page=${page + 1}`}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Next
                    </Link>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
