import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="mt-10 text-center">
      <h1 className="text-2xl font-semibold mb-2">404 – Not found</h1>
      <p className="text-sm text-slate-400 mb-4">
        The page you&apos;re looking for doesn&apos;t exist.
      </p>
      <Link
        to="/"
        className="inline-block text-sm px-4 py-2 rounded-md bg-emerald-500 text-slate-950 hover:bg-emerald-400"
      >
        Go home
      </Link>
    </div>
  );
};

export default NotFound;
