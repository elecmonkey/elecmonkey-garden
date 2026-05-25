import { NextResponse } from "next/server";
import { getPostById } from "@/lib/api";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ slug: string }>;
};

export async function GET(_request: Request, { params }: RouteContext) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }

  try {
    const { slug } = await params;
    const post = await getPostById(slug);

    return NextResponse.json(
      { content: post.content },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      }
    );
  } catch {
    return NextResponse.json({ message: "Not found" }, { status: 404 });
  }
}