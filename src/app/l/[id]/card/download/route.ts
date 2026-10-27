import { getCard } from "@/lib/cards";
import { getDownloadUrl } from "@/lib/storage";
import { parseId } from "@/lib/text";

/** Redirects to a short-lived presigned URL, so the file comes straight from storage. */
export async function GET(_request: Request, ctx: RouteContext<"/l/[id]/card/download">) {
  const id = parseId((await ctx.params).id);
  const card = id ? await getCard(id) : null;
  if (!card) return new Response("Not found", { status: 404 });

  const url = await getDownloadUrl(card.key, `commonplace-line-${id}.png`);
  return new Response(null, {
    status: 302,
    headers: { Location: url, "Cache-Control": "no-store" },
  });
}
