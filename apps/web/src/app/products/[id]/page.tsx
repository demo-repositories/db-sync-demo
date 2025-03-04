import { notFound } from "next/navigation";

import { RichText } from "@/components/richtext";
import { client } from "@/lib/sanity/client";
import { sanityFetch } from "@/lib/sanity/live";
import { queryProductIdPageData, queryProductPaths } from "@/lib/sanity/query";
import { getMetaData } from "@/lib/seo";

async function fetchProductIdPageData(id: string) {
  return await sanityFetch({
    query: queryProductIdPageData,
    params: { id: parseInt(id) },
  });
}

async function fetchProductPaths() {
  const ids = await client.fetch(queryProductPaths);
  const paths: { id: string }[] = [];
  for (const id of ids) {
    if (!id) continue;

    paths.push({ id: id.toString() });
  }
  return paths;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data } = await fetchProductIdPageData(slug);
  if (!data) return getMetaData({});
  return getMetaData(data);
}

export async function generateStaticParams() {
  return await fetchProductPaths();
}

export default async function ProductIdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data } = await fetchProductIdPageData(id);
  if (!data) return notFound();
  const { name, description } = data ?? {};

  return (
    <div className="container my-16 mx-auto px-4 md:px-6">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
        <main>
          <header className="mb-8">
            <h1 className="mt-2 text-4xl font-bold">{name}</h1>
          </header>

          {description && <RichText richText={description ?? []} />}
        </main>
      </div>
    </div>
  );
}
