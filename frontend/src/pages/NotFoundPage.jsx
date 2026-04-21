import { Link } from "react-router-dom";
import Button from "../components/ui/Button";
import { Card, CardBody } from "../components/ui/Card";

export default function NotFoundPage() {
  return (
    <section className="mx-auto max-w-xl">
      <Card>
        <CardBody className="py-14 text-center">
          <p className="text-xs font-extrabold uppercase tracking-widest text-gray-500">404</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">Page not found</h1>
          <p className="mt-2 text-sm text-gray-600">The route you requested does not exist.</p>
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
