import type { Metadata } from "next";
import { loginAction } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "관리자 로그인",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <main className="admin-auth-page">
      <section className="admin-auth-card">
        <p className="eyebrow">Admin</p>
        <h1>관리자 로그인</h1>
        {error ? (
          <p className="admin-error">
            {error === "unauthorized" ? "허용된 관리자 이메일이 아닙니다." : "로그인 정보를 확인해주세요."}
          </p>
        ) : null}
        <form action={loginAction} className="admin-form">
          <label>
            <span>이메일</span>
            <input name="email" type="email" required />
          </label>
          <label>
            <span>비밀번호</span>
            <input name="password" type="password" required />
          </label>
          <button type="submit" className="admin-primary-button">
            로그인
          </button>
        </form>
      </section>
    </main>
  );
}
