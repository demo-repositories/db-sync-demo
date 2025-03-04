import { Barcode } from "lucide-react";
import { defineField, defineType } from "sanity";

export const productType = defineType({
  type: "document",
  name: "product",
  icon: Barcode,
  readOnly: true,
  fields: [
    defineField({
      name: "name",
      type: "string",
    }),
    defineField({
      name: "created_at",
      type: "string",
    }),
    defineField({
      name: "updated_at",
      type: "string",
    }),
    defineField({
      name: "id",
      type: "number",
    }),
  ],
});
