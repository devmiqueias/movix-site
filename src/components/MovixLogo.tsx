// Logo Movix "Sinalização": placa amarela, "M" em tinta e ponto como quadrado de pictograma
// (mesmo desenho de assets/movix-icone.svg no app).
export function MovixMark({ size = 36 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      aria-hidden="true"
      className="movix-brand-mark"
    >
      <rect width="100" height="100" rx="14" fill="#FFD200" />
      <path
        d="M25 73 V30 L50 55 L75 30 V52"
        fill="none"
        stroke="#111111"
        strokeWidth="11"
        strokeLinecap="square"
        strokeLinejoin="miter"
      />
      <rect x="67.5" y="64.5" width="15" height="15" fill="#111111" />
    </svg>
  );
}
