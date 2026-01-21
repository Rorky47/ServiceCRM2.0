import { redirect } from "next/navigation";

interface PageProps {
  params: { slug: string };
}

export default function AdminPage({ params }: PageProps) {
  redirect(`/admin/${params.slug}/dashboard`);
}

