import { PanelsTopLeft } from "lucide-react";
import { defineField, defineType } from "sanity";

export const productPageType = defineType({
  type: "document",
  name: "productPage",
  icon: PanelsTopLeft,
  fields: [
    defineField({
      name: "product",
      type: "reference",
      to: [{ type: "product" }],
    }),
    defineField({
      name: "description",
      type: "richText",
    }),
  ],
  preview: {
    select: {
      title: "product.name",
    },
    prepare({ title }) {
      return {
        title,
      };
    },
  },
});
