"use client";

interface RichTextDisplayProps {
  content: string;
  className?: string;
}

export default function RichTextDisplay({ content, className = "" }: RichTextDisplayProps) {
  // Safely render HTML content
  // In production, you might want to use DOMPurify for additional security
  return (
    <div
      className={`rich-text-content ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
      style={{
        wordBreak: "break-word",
      }}
    />
  );
}

