"use client";

import { useState } from "react";

interface Props {
  src: string;
  alt: string;
  name: string;
  className?: string;
}

export default function LogoWithFallback({ src, alt, name, className = "" }: Props) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-gradient-to-br from-gray-700 to-gray-800 text-white font-bold ${className}`}>
        {name.charAt(0)}
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className={`object-contain ${className}`}
      onError={() => setFailed(true)}
    />
  );
}
