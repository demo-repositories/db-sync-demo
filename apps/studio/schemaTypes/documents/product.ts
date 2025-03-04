import { Barcode } from "lucide-react";
import { defineField, defineType } from "sanity";

export const productType = defineType({
  type: "document",
  name: "product",
  icon: Barcode,
  groups: [
    {
      name: "system",
    },
    {
      name: "editorial",
    },
  ],
  fields: [
    defineField({
      name: "name",
      type: "string",
      readOnly: true,
      group: "system",
    }),
    defineField({
      name: "created_at",
      type: "string",
      readOnly: true,
      group: "system",
    }),
    defineField({
      name: "updated_at",
      type: "string",
      readOnly: true,
      group: "system",
    }),
    defineField({
      name: "id",
      type: "number",
      readOnly: true,
      group: "system",
    }),
    defineField({
      name: "description",
      type: "richText",
      group: "editorial",
    }),
    defineField({
      name: "images",
      type: "array",
      of: [
        {
          type: "image",
          options: {
            hotspot: true,
          },
        },
      ],
      group: "editorial",
    }),
  ],
});
