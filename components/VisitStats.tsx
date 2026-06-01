import type { VisitStats as VisitStatsType } from "@/lib/visits";

const formatter = new Intl.NumberFormat("ko-KR");

export default function VisitStats({ stats }: { stats: VisitStatsType }) {
  const items = [
    { label: "누적 글 수", value: stats.published },
    { label: "오늘 방문자", value: stats.today },
    { label: "누적 방문자", value: stats.total },
  ];

  return (
    <section className="stats-card" aria-label="방문자 통계">
      {items.map((item) => (
        <div key={item.label} className="stat-row">
          <strong>{formatter.format(item.value)}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </section>
  );
}
