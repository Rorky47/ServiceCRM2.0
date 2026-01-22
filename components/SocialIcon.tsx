import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube, FaEnvelope, FaLink } from "react-icons/fa";
import { SocialLink } from "@/types";

interface SocialIconProps {
  platform: SocialLink["platform"];
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function SocialIcon({ platform, size = "md", className = "" }: SocialIconProps) {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const iconClass = `${sizeClasses[size]} ${className}`;

  switch (platform) {
    case "facebook":
      return <FaFacebook className={iconClass} />;
    case "twitter":
      return <FaTwitter className={iconClass} />;
    case "instagram":
      return <FaInstagram className={iconClass} />;
    case "linkedin":
      return <FaLinkedin className={iconClass} />;
    case "youtube":
      return <FaYoutube className={iconClass} />;
    case "email":
      return <FaEnvelope className={iconClass} />;
    default:
      return <FaLink className={iconClass} />;
  }
}

