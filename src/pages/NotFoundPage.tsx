import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <main className="not-found">
      <span>404</span>
      <h1>Esta página no existe.</h1>
      <Link className="button button--primary" to="/">
        Volver al inicio
      </Link>
    </main>
  );
}
