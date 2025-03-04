import { Barcode } from "lucide-react";
import { defineField, defineType } from "sanity";

export const productType = defineType({
  type: "document",
  name: "product",
  icon: Barcode,

  fields: [
    defineField({
      name: "name",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "created_at",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "updated_at",
      type: "string",
      readOnly: true,
    }),
    defineField({
      name: "id",
      type: "number",
      readOnly: true,
    }),
  ],
});
