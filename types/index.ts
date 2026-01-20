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

export type Site = {
  id: string;
  slug: string;
  name: string;
  theme: {
    primaryColor: string;
    font: string;
  };
};

export type Page = {
  siteSlug: string;
  slug: string;
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

