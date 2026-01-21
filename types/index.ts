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
  platform: "facebook" | "twitter" | "instagram" | "linkedin" | "youtube" | "custom";
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
    copyrightText?: string;
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

