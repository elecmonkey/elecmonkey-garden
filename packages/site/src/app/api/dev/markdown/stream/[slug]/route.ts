import fs from "fs";
import fsPromises from "fs/promises";
import path from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const postsDirectory = path.join(process.cwd(), "src/content/posts");

type RouteContext = {
  params: Promise<{ slug: string }>;
};

function encodeSse(event: string, payload: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(payload)}\n\n`;
}

async function watchMarkdownDirectories(onChange: () => void): Promise<fs.FSWatcher[]> {
  const watchers: fs.FSWatcher[] = [];
  const entries = await fsPromises.readdir(postsDirectory, { withFileTypes: true });
  const monthDirs = entries
    .filter((entry) => entry.isDirectory() && /^\d{6}$/.test(entry.name))
    .map((entry) => path.join(postsDirectory, entry.name));

  for (const monthDir of monthDirs) {
    const watcher = fs.watch(monthDir, (_eventType, fileName) => {
      if (typeof fileName === "string" && fileName.endsWith(".md")) {
        onChange();
      }
    });
    watchers.push(watcher);
  }

  return watchers;
}

export async function GET(_request: Request, { params }: RouteContext) {
  // Keep signature explicit for route compatibility and future slug-specific filtering.
  await params;

  if (process.env.NODE_ENV !== "development") {
    return new Response("Not found", { status: 404 });
  }

  const encoder = new TextEncoder();
  let closed = false;
  let watchers: fs.FSWatcher[] = [];
  let heartbeat: ReturnType<typeof setInterval> | null = null;

  const closeAll = () => {
    if (closed) {
      return;
    }
    closed = true;
    if (heartbeat) {
      clearInterval(heartbeat);
      heartbeat = null;
    }
    for (const watcher of watchers) {
      watcher.close();
    }
    watchers = [];
  };

  const stream = new ReadableStream({
    async start(controller) {
      const enqueue = (event: string, payload: unknown) => {
        if (!closed) {
          controller.enqueue(encoder.encode(encodeSse(event, payload)));
        }
      };

      try {
        watchers = await watchMarkdownDirectories(() => {
          enqueue("markdown-update", { ts: Date.now() });
        });
      } catch {
        enqueue("markdown-error", { message: "watch-init-failed" });
      }

      heartbeat = setInterval(() => {
        enqueue("ping", { ts: Date.now() });
      }, 15000);
    },
    cancel() {
      closeAll();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}