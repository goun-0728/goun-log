import type { VisitStats } from "@/lib/visits";

const formatter = new Intl.NumberFormat("ko-KR");

export default function HomeStats({ stats }: { stats: VisitStats }) {
  const items = [
    { label: "누적 글 수", value: stats.published },
    { label: "오늘 방문자", value: stats.today },
    { label: "누적 방문자", value: stats.total },
  ];

  return (
    <section className="home-stats" aria-label="사이트 통계">
      {items.map((item) => (
        <div key={item.label} className="home-stat-item">
          <strong>{formatter.format(item.value)}</strong>
          <span>{item.label}</span>
        </div>
      ))}
    </section>
  );
}
