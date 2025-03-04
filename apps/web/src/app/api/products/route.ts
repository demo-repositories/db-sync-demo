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
    if (!type) {
      return NextResponse.json(
        { error: "Invalid webhook data" },
        { status: 400 },
      );
    }
    const sanityId = (id) => `product-${id}`;

    if (type === "DELETE") {
      // Delete product document from Sanity
      await client.delete(sanityId(old_record.id));
      return NextResponse.json({ message: "Product deleted" }, { status: 200 });
    }

    const { id } = record;
    console.log("Received Supabase Webhook:", { type, record });

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
        { status: 200 },
      );
    }

    return NextResponse.json(
      { message: "Unhandled event type" },
      { status: 400 },
    );
  } catch (error) {
    console.error("Sanity Webhook Error:", error);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}
