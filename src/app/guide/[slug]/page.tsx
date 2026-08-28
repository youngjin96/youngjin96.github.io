import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs, Card, Prose, SectionTitle } from "@/components/ui";
import { AdSlot } from "@/components/AdSlot";
import {
  JsonLd,
  articleJsonLd,
  breadcrumbJsonLd,
  faqJsonLd,
} from "@/components/JsonLd";
import { getGuide, guides } from "@/lib/guides";
import { guideContents } from "./content";
import { pageMetadata } from "@/site.config";

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: PageProps<"/guide/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuide(slug);
  if (!guide) return { title: "문서를 찾을 수 없습니다" };

  return pageMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guide/${guide.slug}`,
    publishedTime: guide.updated,
  });
}

export default async function GuidePage({ params }: PageProps<"/guide/[slug]">) {
  const { slug } = await params;
  const guide = getGuide(slug);
  const content = guideContents[slug];
  if (!guide || !content) notFound();

  const others = guides.filter((g) => g.slug !== slug);
  const crumbs = [
    { name: "홈", href: "/" },
    { name: "가이드", href: "/guide" },
    { name: guide.title },
  ];

  return (
    <>
      <JsonLd
        data={[
          breadcrumbJsonLd(crumbs),
          articleJsonLd({
            headline: guide.title,
            description: guide.description,
            path: `/guide/${guide.slug}`,
            datePublished: guide.updated,
          }),
          faqJsonLd(content.faqs),
        ]}
      />
      <Breadcrumbs items={crumbs} />

      <article>
        <header>
          <h1 className="text-2xl font-extrabold leading-snug tracking-tight sm:text-3xl">
            {guide.title}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {guide.description}
          </p>
          <p className="mt-3 text-xs text-muted">
            <time dateTime={guide.updated}>{guide.updated}</time> 업데이트
          </p>
        </header>

        <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_TOP} />

        <Card className="mt-6">
          <Prose>{content.body}</Prose>
        </Card>

        <AdSlot slot={process.env.NEXT_PUBLIC_AD_SLOT_MID} />

        <section className="mt-8">
          <SectionTitle>자주 묻는 질문</SectionTitle>
          <Card>
            <dl className="divide-y divide-line">
              {content.faqs.map((f) => (
                <div key={f.q} className="py-4 first:pt-0 last:pb-0">
                  <dt className="font-semibold">{f.q}</dt>
                  <dd className="mt-1.5 text-sm leading-relaxed text-muted">
                    {f.a}
                  </dd>
                </div>
              ))}
            </dl>
          </Card>
        </section>

        <section className="mt-8">
          <SectionTitle>다른 가이드</SectionTitle>
          <ul className="grid gap-3 sm:grid-cols-2">
            {others.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/guide/${g.slug}`}
                  className="block h-full rounded-2xl border border-line bg-surface p-4 transition-colors hover:bg-surface-2"
                >
                  <h3 className="text-sm font-bold leading-snug">{g.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">
                    {g.summary}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </>
  );
}
