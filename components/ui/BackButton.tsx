'use client';

export default function BackButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="text-gray-500 hover:text-gray-700 transition-colors text-sm underline"
    >
      ← Volver a la página anterior
    </button>
  );
}