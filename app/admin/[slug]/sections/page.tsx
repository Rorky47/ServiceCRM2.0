import { getSite, getPage } from "@/lib/data";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";

interface SectionsPageProps {
  params: { slug: string };
  searchParams: { page?: string };
}

export default async function SectionsPage({ params, searchParams }: SectionsPageProps) {
  const site = await getSite(params.slug);
  if (!site) {
    notFound();
  }

  const pageSlug = searchParams.page || "home";
  const page = await getPage(params.slug, pageSlug);

  if (!page) {
    redirect(`/admin/${params.slug}/pages`);
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Sections</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage sections for page: <strong>/{pageSlug}</strong>
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <p className="text-gray-600 mb-4">
          To manage sections, go to the page in edit mode and use the drag & drop interface.
        </p>
        <Link
          href={`/site/${params.slug}/${pageSlug}?admin=true`}
          className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Edit Page Sections →
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-semibold mb-4">Current Sections ({page.sections.length})</h2>
        {page.sections.length === 0 ? (
          <p className="text-gray-500">No sections yet. Add sections in edit mode.</p>
        ) : (
          <ul className="space-y-2">
            {page.sections.map((section, index) => (
              <li key={section.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div>
                  <span className="font-medium">{index + 1}. {section.type}</span>
                  {section.type === "hero" && section.content.headline && (
                    <p className="text-sm text-gray-500">{section.content.headline}</p>
                  )}
                  {section.type === "services" && section.content.title && (
                    <p className="text-sm text-gray-500">{section.content.title}</p>
                  )}
                  {section.type === "textImage" && section.content.title && (
                    <p className="text-sm text-gray-500">{section.content.title}</p>
                  )}
                  {section.type === "contact" && section.content.title && (
                    <p className="text-sm text-gray-500">{section.content.title}</p>
                  )}
                </div>
                <Link
                  href={`/site/${params.slug}/${pageSlug}?admin=true#section-${section.id}`}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Edit →
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

