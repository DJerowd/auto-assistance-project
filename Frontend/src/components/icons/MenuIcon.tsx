import React from 'react';

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const MenuIcon = ({ size = 24, ...props }: IconProps) => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 24 24"
    height={size}
    width={size}
    {...props}
  >
    <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"></path>
  </svg>
);