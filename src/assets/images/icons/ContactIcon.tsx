function ContactIcon({ width = 24, height = 24, color = "white" }: 
  { width?: number; height?: number; color?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Head */}
      <circle cx="12" cy="8" r="4" />
      {/* Body */}
      <path d="M6 20c0-3.333 5.333-5 6-5s6 1.667 6 5" />
    </svg>
  );
}

export default ContactIcon;
