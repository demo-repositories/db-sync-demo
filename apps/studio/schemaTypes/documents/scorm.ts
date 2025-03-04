import { FileArchive } from "lucide-react";
import { defineField, defineType } from "sanity";

export const scormType = defineType({
  type: "document",
  name: "scorm",
  icon: FileArchive,
  fields: [
    defineField({
      name: "file",
      type: "file",
    }),
    defineField({
      name: "title",
      type: "string",
    }),
    defineField({
      name: "body",
      type: "richText",
    }),
  ],
});
