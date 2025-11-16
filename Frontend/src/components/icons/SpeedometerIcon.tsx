import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const SpeedometerIcon = ({ size = 20, ...props }: IconProps) => (
  <svg
    stroke="currentColor"
    fill="none"
    strokeWidth="2"
    viewBox="0 0 24 24"
    strokeLinecap="round"
    strokeLinejoin="round"
    height={size}
    width={size}
    {...props}
  >
    <path d="M12 12a10 10 0 0 0-10 10c0-5.52 4.48-10 10-10s10 4.48 10 10c0-5.52-4.48-10-10-10z"></path>
    <path d="M12 12v-4"></path>
    <path d="m16 16-2.5-2.5"></path>
  </svg>
);
