import { Link } from "react-router-dom";

export default function NotFoundPage() {
  return (
    <section className="rounded-xl bg-white p-8 text-center shadow-sm">
      <h1 className="text-3xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-2 text-gray-600">The route you requested does not exist.</p>
      <Link
        to="/"
        className="mt-4 inline-block rounded bg-gray-900 px-4 py-2 font-semibold text-white"
      >
        Go home
      </Link>
    </section>
  );
}
