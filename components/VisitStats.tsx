import type { VisitStats as VisitStatsType } from "@/lib/visits";

const formatter = new Intl.NumberFormat("ko-KR");

export default function VisitStats({ stats }: { stats: VisitStatsType }) {
  const items = [
    { label: "누적 글 수", value: formatter.format(stats.published) },
    {
      label: "누적 상세페이지 생성 수",
      value: stats.generationsReady ? formatter.format(stats.generations) : "곧 표시됩니다",
    },
    { label: "누적 방문자 수", value: formatter.format(stats.total) },
  ];

  return (
    <section className="stats-card" aria-label="사이트 통계">
      {items.map((item) => (
        <div key={item.label} className="stat-row">
          <strong>{item.value}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </section>
  );
}
