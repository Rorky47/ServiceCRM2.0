export type Section =
  | {
      id: string;
      type: "hero";
      content: {
        headline: string;
        subheadline: string;
        image: string;
        backgroundColor?: string;
        ctaButton?: {
          text: string;
          link: string;
        };
      };
    }
  | {
      id: string;
      type: "services";
      content: {
        title: string;
        backgroundColor?: string;
        items: Array<{
          title: string;
          description?: string;
          image?: string;
          color?: string;
          button?: {
            text: string;
            link: string;
          };
        }>;
      };
    }
  | {
      id: string;
      type: "textImage";
      content: {
        title: string;
        text: string;
        image: string;
        titleColor?: string;
        textColor?: string;
      };
    }
  | {
      id: string;
      type: "contact";
      content: {
        title: string;
        description: string;
      };
    };

export type SocialLink = {
  platform: "facebook" | "twitter" | "instagram" | "linkedin" | "youtube" | "email" | "custom";
  url: string;
  label?: string;
};

export type Site = {
  id: string;
  slug: string;
  domains: string[]; // One or more domains
  name: string;
  theme: {
    primaryColor: string;
    font: string;
    logo?: string;
    favicon?: string;
  };
  seo?: {
    title?: string;
    description?: string;
    keywords?: string;
    image?: string;
    googleVerification?: string;
    facebookAppId?: string;
  };
  analytics?: {
    googleAnalyticsId?: string;
    googleTagManagerId?: string;
    facebookPixelId?: string;
  };
  notifications?: {
    enabled: boolean;
    leadEmail?: string;
  };
  customCode?: {
    head?: string;
    footer?: string;
  };
  // Shared social links used by both header and footer
  socialLinks?: SocialLink[];
  header?: {
    showLogo: boolean;
    // If logo is not set, will use theme.logo
    logo?: string;
    logoLink?: string; // Where the logo links (default: site home)
    logoSize?: "small" | "medium" | "large" | "xlarge";
    logoScale?: number; // Percentage scale (50-200)
    navigationLinks?: Array<{
      label: string;
      url: string;
    }>;
    phoneNumber?: string;
    // If socialLinks is not set, will use site.socialLinks
    socialLinks?: SocialLink[];
    showGetQuoteButton: boolean;
    getQuoteButtonText?: string;
    getQuoteButtonLink?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  footer?: {
    showLogo: boolean;
    // If logo is not set, will use theme.logo
    logo?: string;
    logoSize?: "small" | "medium" | "large" | "xlarge";
    logoScale?: number; // Percentage scale (50-200)
    /**
     * Footer spacing configuration, stored as multipliers of the preset spacing unit.
     * Example: 1 = 40px when PRESET_SPACING_UNIT is 40.
     */
    columnGap?: number;
    topPadding?: number;
    bottomPadding?: number;
    bottomMargin?: number;
    copyrightText?: string;
    emailAddress?: string;
    phoneNumber?: string;
    columns?: Array<{
      title: string;
      links: Array<{
        label: string;
        url: string;
      }>;
    }>;
    // If socialLinks is not set, will use site.socialLinks
    socialLinks?: SocialLink[];
    backgroundColor?: string;
    textColor?: string;
  };
};

export type Page = {
  siteSlug: string;
  slug: string;
  title?: string; // Optional page title
  sections: Section[];
};

export type Lead = {
  id: string;
  siteSlug: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
};

export type User = {
  id: string;
  email: string;
  role: "siteOwner" | "superAdmin";
  siteSlugs?: string[]; // For siteOwner role
};

