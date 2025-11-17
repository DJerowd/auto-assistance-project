import React from "react";

interface IconProps extends React.SVGProps<SVGSVGElement> {
  size?: number;
}

export const MoneyIcon = ({ size = 20, ...props }: IconProps) => (
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
    <path d="M2 7C2 5.89543 2.89543 5 4 5H20C21.1046 5 22 5.89543 22 7V17C22 18.1046 21.1046 19 20 19H4C2.89543 19 2 18.1046 2 17V7Z" />
    <circle cx="12" cy="12" r="3" />
    <path d="M2 9V9C4.20914 9 6 7.20914 6 5V5" />
    <path d="M18 19V19C18 16.7909 19.7909 15 22 15V15" />
  </svg>
);
