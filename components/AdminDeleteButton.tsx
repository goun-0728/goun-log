"use client";

export default function AdminDeleteButton() {
  return (
    <button
      type="submit"
      onClick={(event) => {
        if (!window.confirm("정말 삭제하시겠습니까?")) {
          event.preventDefault();
        }
      }}
    >
      삭제
    </button>
  );
}
