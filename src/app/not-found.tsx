import Link from "next/link";

export default function NotFound() {
  return (
    <section className="flex flex-col items-start gap-4">
      <h1 className="font-serif text-4xl font-medium tracking-tight">Nothing here.</h1>
      <p className="text-muted">That line or category doesn’t exist.</p>
      <Link href="/" className="button">
        Back to Commonplace
      </Link>
    </section>
  );
}
