import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import { Card, CardBody } from "../components/ui/Card";

export default function NotFoundPage() {
  return (
    <section className="mx-auto max-w-xl">
      <Card className="overflow-hidden rounded-[2rem] border border-slate-200 shadow-[0_24px_70px_-46px_rgba(15,23,42,0.42)]">
        <div className="border-b border-slate-200 bg-[linear-gradient(180deg,_#fffaf0_0%,_#ffffff_100%)] px-6 py-5">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-slate-500">404</p>
          <h1 className="mt-2 text-3xl font-black tracking-[-0.03em] text-slate-950 sm:text-4xl">Page not found</h1>
          <p className="mt-2 text-sm text-slate-600">The route you requested does not exist.</p>
        </div>
        <CardBody className="py-10 text-center">
          <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
            <Link to="/">
              <Button>Go home</Button>
            </Link>
            <Link to="/products">
              <Button variant="secondary">Shop products</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
