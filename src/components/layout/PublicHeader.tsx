import { Link } from 'react-router-dom';

import { clientEnv } from '../../config/env';
import { BrandLogo } from './BrandLogo';

export function PublicHeader() {
  return (
    <header className="public-header">
      <Link className="brand" to="/" aria-label={`${clientEnv.businessName}, inicio`}>
        <BrandLogo className="brand-logo--header" decorative />
      </Link>
      <Link className="text-link" to="/admin/login">
        Administración
      </Link>
    </header>
  );
}
