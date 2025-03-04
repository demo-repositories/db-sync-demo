import { defineLocations } from "sanity/presentation";

export const locations = {
  blog: defineLocations({
    select: {
      title: "title",
      slug: "slug.current",
    },
    resolve: (doc) => {
      return {
        locations: [
          {
            title: doc?.title || "Untitled",
            href: `${doc?.slug}`,
          },
          {
            title: "Blog",
            href: "/blog",
          },
        ],
      };
    },
  }),
  home: defineLocations({
    select: {
      title: "title",
      slug: "slug.current",
    },
    resolve: () => {
      return {
        locations: [
          {
            title: "Home",
            href: "/",
          },
        ],
      };
    },
  }),
  page: defineLocations({
    select: {
      title: "title",
      slug: "slug.current",
    },
    resolve: (doc) => {
      return {
        locations: [
          {
            title: doc?.title || "Untitled",
            href: `${doc?.slug}`,
          },
        ],
      };
    },
  }),
  // productPage: defineLocations({
  //   select: {
  //     name: "product->{name}",
  //     id: "id",
  //   },
  //   resolve: (doc) => {
  //     console.log("doc", doc);
  //     return {
  //       locations: [
  //         {
  //           title: doc?.name || "Untitled",
  //           href: `/products/${parseInt(doc?.id)}`,
  //         },
  //       ],
  //     };
  //   },
  // }),
};
