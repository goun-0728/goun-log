import type { Metadata } from "next";
import { loginAction } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "관리자 로그인 | GOUN LOG",
};

const errorMessages: Record<string, string> = {
  "invalid-login": "이메일 또는 비밀번호가 맞지 않습니다.",
  "not-admin": "허용된 관리자 이메일이 아닙니다.",
  "missing-admin-email": "ADMIN_EMAIL 환경변수가 설정되어 있지 않습니다.",
  supabase: "Supabase 연결 오류가 발생했습니다.",
  unauthorized: "허용된 관리자 이메일이 아닙니다.",
  login: "이메일 또는 비밀번호가 맞지 않습니다.",
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
        {error ? <p className="admin-error">{errorMessages[error] || "로그인 정보를 확인해주세요."}</p> : null}
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
