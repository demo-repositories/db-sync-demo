# Next.js Monorepo with Sanity CMS

A modern, full-stack monorepo template built with Next.js App Router, Sanity CMS, Shadcn UI, and TurboRepo.

![Easiest way to build a webpage](https://raw.githubusercontent.com/robotostudio/turbo-start-sanity/main/turbo-start-sanity-og.png)

## Features

### Monorepo Structure

- Apps: web (Next.js frontend) and studio (Sanity Studio)
- Shared packages: UI components, TypeScript config, ESLint config
- Turborepo for build orchestration and caching

### Frontend (Web)

- Next.js App Router with TypeScript
- Shadcn UI components with Tailwind CSS
- Server Components and Server Actions
- SEO optimization with metadata
- Blog system with rich text editor
- Table of contents generation
- Responsive layouts

### Content Management (Studio)

- Sanity Studio v3
- Custom document types (Blog, FAQ, Pages)
- Visual editing integration
- Structured content with schemas
- Live preview capabilities
- Asset management

## Getting Started

### Installing the template

#### 1. Initialize template with Sanity CLI

Run the command in your Terminal to initialize this template on your local computer.

See the documentation if you are [having issues with the CLI](https://www.sanity.io/help/cli-errors).

```shell
npm create sanity@latest -- --template robotostudio/turbo-start-sanity
```

Install additional deps

```shell
npm i @supabase/ssr @supabase/supabase-js --workspace=web
```

#### 2. Add files

Add the following files to the project. In `./apps/web`

```typescript
// ./apps/web/src/app/api/products/route.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { client as sanityClient } from "@/lib/sanity/client";
import { writeToken } from "@/lib/sanity/token";

// Configure Sanity client with a token for write operations
const client = sanityClient.withConfig({ token: writeToken });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, record, old_record } = body;
    console.log("Received Supabase Webhook:", body);

    if (!type) {
      return NextResponse.json(
        { error: "Invalid webhook data" },
        { status: 400 }
      );
    }

    // Helper function to generate a Sanity document ID
    const sanityId = (id: string) => `product-${id}`;

    if (type === "DELETE") {
      // Delete product document from Sanity
      await client.delete(sanityId(old_record.id));
      return NextResponse.json({ message: "Product deleted" }, { status: 200 });
    }

    const { id } = record;

    if (type === "INSERT" || type === "UPDATE") {
      const docId = sanityId(id);

      // Fetch existing document
      const existingDoc = await client.getDocument(docId);

      // Merge existing fields with the new data (new data takes precedence)
      const updatedDoc = {
        _id: docId,
        _type: "product",
        ...existingDoc, // Preserve existing fields
        ...record, // Overwrite with new data
      };

      // Upsert product document in Sanity
      const result = await client.createOrReplace(updatedDoc);

      return NextResponse.json(
        { message: "Product saved", product: result },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "Unhandled event type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Sanity Webhook Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
```

```typescript
// ./apps/web/src/lib/supabase/server.ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  );
}
```

Update `./apps/web/src/lib/sanity/token.ts` to include the write token:

```typescript
// ./apps/web/src/lib/sanity/token.ts
import "server-only";

export const token = process.env.SANITY_API_READ_TOKEN;

if (!token) {
  throw new Error("Missing SANITY_API_READ_TOKEN");
}

export const writeToken = process.env.SANITY_API_WRITE_TOKEN;

if (!writeToken) {
  throw new Error("Missing SANITY_API_WRITE_TOKEN");
}
```

In `./apps/web/.env.local` add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase.

```env
# ...rest of environment variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Then in `./apps/studio`:

```typescript
// ./apps/studio/schemaTypes/documents/product.ts
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
```

```typescript
// ./apps/studio/schemaTypes/documents/scorm.ts
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
```

Update `./apps/studio/schemaTypes/documents/index.ts`:

```typescript
// ./apps/studio/schemaTypes/documents/index.ts
import { author } from "./author";
import { blog } from "./blog";
import { blogIndex } from "./blog-index";
import { faq } from "./faq";
import { footer } from "./footer";
import { homePage } from "./home-page";
import { navbar } from "./navbar";
import { page } from "./page";
import { productType } from "./product";
import { scormType } from "./scorm";
import { settings } from "./settings";
export const singletons = [homePage, blogIndex, settings, footer, navbar];

export const documents = [
  blog,
  page,
  faq,
  author,
  productType,
  scormType,
  ...singletons,
];
```

Then update the `structure.ts` file:

```typescript
// ./apps/studio/structure.ts
import {
  Barcode,
  BookMarked,
  CogIcon,
  File,
  FileArchive,
  FileText,
  HomeIcon,
  type LucideIcon,
  MessageCircleQuestion,
  PanelBottomIcon,
  PanelsTopLeft,
  PanelTopDashedIcon,
  Settings2,
  User,
} from "lucide-react";
import type {
  StructureBuilder,
  StructureResolverContext,
} from "sanity/structure";

import type { SchemaType, SingletonType } from "./schemaTypes";
import { getTitleCase } from "./utils/helper";

type Base<T = SchemaType> = {
  id?: string;
  type: T;
  preview?: boolean;
  title?: string;
  icon?: LucideIcon;
};

type CreateSingleTon = {
  S: StructureBuilder;
} & Base<SingletonType>;

const createSingleTon = ({ S, type, title, icon }: CreateSingleTon) => {
  const newTitle = title ?? getTitleCase(type);
  return S.listItem()
    .title(newTitle)
    .icon(icon ?? File)
    .child(S.document().schemaType(type).documentId(type));
};

type CreateList = {
  S: StructureBuilder;
} & Base;

// This function creates a list item for a type. It takes a StructureBuilder instance (S),
// a type, an icon, and a title as parameters. It generates a title for the type if not provided,
// and uses a default icon if not provided. It then returns a list item with the generated or
// provided title and icon.

const createList = ({ S, type, icon, title, id }: CreateList) => {
  const newTitle = title ?? getTitleCase(type);
  return S.documentTypeListItem(type)
    .id(id ?? type)
    .title(newTitle)
    .icon(icon ?? File);
};

type CreateIndexList = {
  S: StructureBuilder;
  list: Base;
  index: Base<SingletonType>;
};

const createIndexList = ({ S, index, list }: CreateIndexList) => {
  const indexTitle = index.title ?? getTitleCase(index.type);
  const listTitle = list.title ?? getTitleCase(list.type);
  return S.listItem()
    .title(listTitle)
    .icon(index.icon ?? File)
    .child(
      S.list()
        .title(indexTitle)
        .items([
          S.listItem()
            .title(indexTitle)
            .icon(index.icon ?? File)
            .child(
              S.document()
                .views([S.view.form()])
                .schemaType(index.type)
                .documentId(index.type)
            ),
          S.documentTypeListItem(list.type)
            .title(`${listTitle}`)
            .icon(list.icon ?? File),
        ])
    );
};

export const structure = (
  S: StructureBuilder,
  context: StructureResolverContext
) => {
  return S.list()
    .title("Content")
    .items([
      createSingleTon({ S, type: "homePage", icon: HomeIcon }),
      S.divider(),
      createList({ S, type: "page", title: "Pages" }),
      createIndexList({
        S,
        index: { type: "blogIndex", icon: BookMarked },
        list: { type: "blog", title: "Blogs", icon: FileText },
      }),
      createList({
        S,
        type: "faq",
        title: "FAQs",
        icon: MessageCircleQuestion,
      }),
      createList({ S, type: "author", title: "Authors", icon: User }),
      S.divider(),
      createList({ S, type: "product", title: "Products", icon: Barcode }),
      S.divider(),
      createList({ S, type: "scorm", title: "Scorm", icon: FileArchive }),
      S.divider(),

      S.listItem()
        .title("Site Configuration")
        .icon(Settings2)
        .child(
          S.list()
            .title("Site Configuration")
            .items([
              createSingleTon({
                S,
                type: "navbar",
                title: "Navigation",
                icon: PanelTopDashedIcon,
              }),
              createSingleTon({
                S,
                type: "footer",
                title: "Footer",
                icon: PanelBottomIcon,
              }),
              createSingleTon({
                S,
                type: "settings",
                title: "Global Settings",
                icon: CogIcon,
              }),
            ])
        ),
    ]);
};
```

#### 3. Run Studio and Next.js app locally

Navigate to the template directory using `cd <your app name>`, and start the development servers by running the following command

```shell
pnpm run dev
```

#### 4. Open the app and sign in to the Studio

Open the Next.js app running locally in your browser on [http://localhost:3000](http://localhost:3000).

Open the Studio running locally in your browser on [http://localhost:3333](http://localhost:3333). You should now see a screen prompting you to log in to the Studio. Use the same service (Google, GitHub, or email) that you used when you logged in to the CLI.

### Adding content with Sanity

#### 1. Publish your first document

The template comes pre-defined with a schema containing `Author`, `Blog`, `BlogIndex`, `FAQ`, `Footer`, `HomePage`, `Navbar`, `Page`, and `Settings` document types.

From the Studio, click "+ Create" and select the `Blog` document type. Go ahead and create and publish the document.

Your content should now appear in your Next.js app ([http://localhost:3000](http://localhost:3000)) as well as in the Studio on the "Presentation" Tab

#### 2. Sample Content

When you initialize the template using the Sanity CLI, sample content is automatically imported into your project. This includes example blog posts, authors, and other content types to help you get started quickly.

#### 3. Extending the Sanity schema

The schemas for all document types are defined in the `studio/schemaTypes/documents` directory. You can [add more document types](https://www.sanity.io/docs/schema-types) to the schema to suit your needs.

### Deploying your application and inviting editors

#### 1. Deploy Sanity Studio

Your Next.js frontend (`/web`) and Sanity Studio (`/studio`) are still only running on your local computer. It's time to deploy and get it into the hands of other content editors.

The template includes a GitHub Actions workflow [`deploy-sanity.yml`](https://raw.githubusercontent.com/robotostudio/turbo-start-sanity/main/.github/workflows/deploy-sanity.yml) that automatically deploys your Sanity Studio whenever changes are pushed to the `studio` directory.

> **Note**: To use the GitHub Actions workflow, make sure to configure the following secrets in your repository settings:
>
> - `SANITY_DEPLOY_TOKEN`
> - `SANITY_STUDIO_PROJECT_ID`
> - `SANITY_STUDIO_DATASET`
> - `SANITY_STUDIO_TITLE`
> - `SANITY_STUDIO_PRESENTATION_URL`

Alternatively, you can manually deploy from your Studio directory (`/studio`) using:

```shell
npx sanity deploy
```

#### 2. Deploy Next.js app to Vercel

You have the freedom to deploy your Next.js app to your hosting provider of choice. With Vercel and GitHub being a popular choice, we'll cover the basics of that approach.

1. Create a GitHub repository from this project. [Learn more](https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github).
2. Create a new Vercel project and connect it to your Github repository.
3. Set the `Root Directory` to your Next.js app (`/apps/web`).
4. Configure your Environment Variables.

#### 3. Invite a collaborator

Now that you’ve deployed your Next.js application and Sanity Studio, you can optionally invite a collaborator to your Studio. Open up [Manage](https://www.sanity.io/manage), select your project and click "Invite project members"

They will be able to access the deployed Studio, where you can collaborate together on creating content.
