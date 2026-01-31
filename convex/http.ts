import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { Id } from "./_generated/dataModel";

const http = httpRouter();

http.route({
  path: "/files",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    const { searchParams } = new URL(request.url);
    const storageId = searchParams.get("id") as Id<"_storage"> | null;
    if (!storageId) {
      return new Response("Missing id", { status: 400 });
    }

    const blob = await ctx.storage.get(storageId);
    if (blob === null) {
      return new Response("File not found", { status: 404 });
    }

    return new Response(blob);
  }),
});

export default http;