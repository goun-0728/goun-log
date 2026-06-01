import Link from "next/link";

export default function NotFound() {
  return (
    <main className="simple-page">
      <section>
        <h1>페이지를 찾을 수 없습니다.</h1>
        <Link href="/" className="back-link">
          홈으로 돌아가기
        </Link>
      </section>
    </main>
  );
}
