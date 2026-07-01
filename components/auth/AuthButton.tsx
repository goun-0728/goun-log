"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AuthButton() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (loading) return null;

  if (!user) {
    return (
      <button type="button" className="auth-login-btn" onClick={() => signInWithGoogle()}>
        로그인
      </button>
    );
  }

  const name = (user.user_metadata?.full_name || user.user_metadata?.name || user.email || "사용자") as string;
  const avatarUrl = (user.user_metadata?.avatar_url || user.user_metadata?.picture) as string | undefined;

  return (
    <div className="auth-menu" ref={menuRef}>
      <button
        type="button"
        className="auth-profile-btn"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="auth-avatar" referrerPolicy="no-referrer" />
        ) : (
          <span className="auth-avatar auth-avatar-fallback">{name.slice(0, 1)}</span>
        )}
        <span className="auth-name">{name}</span>
      </button>
      {open ? (
        <div className="auth-dropdown">
          <button
            type="button"
            onClick={() => {
              setOpen(false);
              signOut();
            }}
          >
            로그아웃
          </button>
        </div>
      ) : null}
    </div>
  );
}
