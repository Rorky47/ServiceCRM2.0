import { getLeads, getSite } from "@/lib/data";
import { notFound } from "next/navigation";

interface PageProps {
  params: { slug: string };
}

export default async function LeadsPage({ params }: PageProps) {
  const site = await getSite(params.slug);
  if (!site) {
    notFound();
  }

  const leads = await getLeads(params.slug);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Leads for {site.name}</h1>
          <a href={`/site/${params.slug}?admin=true`} className="text-blue-600 underline">
            ← Back to Site
          </a>
        </div>
        {leads.length === 0 ? (
          <p className="text-gray-500">No leads yet.</p>
        ) : (
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
        )}
      </div>
    </div>
  );
}

