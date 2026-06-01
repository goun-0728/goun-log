import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-3xl px-5 pb-20 pt-16 sm:px-6">
      <h1 className="mb-4 text-[32px] font-semibold">페이지를 찾을 수 없습니다.</h1>
      <Link href="/" className="text-[15px] text-neutral-500 transition-colors hover:text-neutral-950">
        홈으로 돌아가기
      </Link>
    </main>
  );
}
