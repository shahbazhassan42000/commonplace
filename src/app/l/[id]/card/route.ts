import { getCard } from "@/lib/cards";
import { parseId } from "@/lib/text";

export async function GET(_request: Request, ctx: RouteContext<"/l/[id]/card">) {
  const id = parseId((await ctx.params).id);
  const card = id ? await getCard(id) : null;
  if (!card) return new Response("Not found", { status: 404 });

  return new Response(Buffer.from(card.png), {
    headers: {
      "Content-Type": "image/png",
      // Lines never change and the URL carries ?v=CARD_VERSION.
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Card-Source": card.source,
    },
  });
}
