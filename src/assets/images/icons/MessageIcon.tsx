
function MessageIcon({ width = 24, height = 24, color = "white" }: 
  { width?: number; height?: number; color?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}      // now dynamic
      height={height}    // now dynamic
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}     // dynamic color
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
    </svg>
  );
}

export default MessageIcon;
