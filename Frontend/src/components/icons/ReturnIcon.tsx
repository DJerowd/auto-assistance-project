import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const ReturnIcon = ({ size = 20, ...props }: IconProps) => (
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
    <line x1="19" y1="12" x2="5" y2="12"></line>
    <polyline points="12 19 5 12 12 5"></polyline>
  </svg>
);