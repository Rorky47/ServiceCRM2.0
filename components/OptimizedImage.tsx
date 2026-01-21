import Image from "next/image";
import { ImgHTMLAttributes } from "react";

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  fill?: boolean;
  className?: string;
  unoptimized?: boolean;
  onClick?: () => void;
}

/**
 * OptimizedImage component that handles both data URLs (base64) and regular image URLs.
 * For data URLs, it uses a regular <img> tag since Next.js Image doesn't support them.
 * For regular URLs, it uses Next.js Image component for optimization.
 */
export default function OptimizedImage({
  src,
  alt,
  width,
  height,
  fill = false,
  className = "",
  unoptimized = false,
  onClick,
  ...props
}: OptimizedImageProps) {
  // Check if it's a data URL (base64 image)
  if (src.startsWith("data:")) {
    // If fill is true, make the image fill its container
    const fillStyles = fill
      ? {
          position: "absolute" as const,
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
        }
      : {};
    
    // Ensure object-fit class is present for fill images
    const hasObjectFit = className.includes("object-");
    const objectFitClass = fill && !hasObjectFit ? "object-cover" : "";
    const finalClassName = objectFitClass ? `${className} ${objectFitClass}`.trim() : className;
    
    return (
      <img
        src={src}
        alt={alt}
        className={finalClassName}
        onClick={onClick}
        style={{
          cursor: onClick ? "pointer" : "default",
          ...fillStyles,
        }}
        {...props}
      />
    );
  }

  // For regular URLs, use Next.js Image component
  if (fill) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className={className}
        onClick={onClick}
        style={{ cursor: onClick ? "pointer" : "default" }}
        unoptimized={unoptimized}
        {...props}
      />
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={width || 200}
      height={height || 200}
      className={className}
      onClick={onClick}
      style={{ cursor: onClick ? "pointer" : "default" }}
      unoptimized={unoptimized}
      {...props}
    />
  );
}

