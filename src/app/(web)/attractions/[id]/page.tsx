import { getAttractionById } from "@/lib/data";

type AttractionDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AttractionDetailPage({ params }: AttractionDetailPageProps) {
  const { id } = await params;
  const attraction = await getAttractionById(id);

  return (
    <main className="page-shell">
      <p className="section-label">/attractions/{id}</p>
      <section className="mt-4 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="min-h-80 rounded-lg bg-[#cbded7]" />
        <div className="soft-card rounded-lg p-6">
          <p className="text-sm font-semibold text-[#667165]">
            {attraction.region} · {attraction.category}
          </p>
          <h1 className="mt-2 text-3xl font-bold">{attraction.name}</h1>
          <p className="mt-4 leading-7 text-[#4f5b52]">
            {attraction.summary}
          </p>
          <dl className="mt-6 grid gap-3 text-sm">
            <div>
              <dt className="text-[#667165]">주소</dt>
              <dd className="font-semibold">{attraction.address}</dd>
            </div>
            <div>
              <dt className="text-[#667165]">예상 비용</dt>
              <dd className="font-semibold">입장/체험비 {attraction.estimatedCost.toLocaleString("ko-KR")}원</dd>
            </div>
            <div>
              <dt className="text-[#667165]">출처</dt>
              <dd className="font-semibold">{attraction.source}</dd>
            </div>
          </dl>
          <a
            href={attraction.mapUrl}
            className="primary-button mt-6"
          >
            카카오맵 길찾기
          </a>
        </div>
      </section>
    </main>
  );
}
