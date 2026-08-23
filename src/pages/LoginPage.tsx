import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';

import { errorMessage } from '../api/client';
import { useAuth } from '../auth/auth-context';
import { BrandLogo } from '../components/layout/BrandLogo';
import { Alert } from '../components/ui/Alert';
import { Spinner } from '../components/ui/Spinner';
import { clientEnv } from '../config/env';
import { loginFormSchema, type LoginFormValues } from '../validations/forms';

export function LoginPage() {
  const { login, isAuthenticated, isInitializing } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitError, setSubmitError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: { email: '', password: '' },
  });

  if (isInitializing) {
    return (
      <main className="session-loading">
        <Spinner label="Verificando sesión" />
      </main>
    );
  }

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const submit = async (values: LoginFormValues) => {
    setSubmitError('');
    setIsSubmitting(true);
    try {
      await login(values);
      const state = location.state as { from?: string } | null;
      navigate(state?.from ?? '/admin', { replace: true });
    } catch (error: unknown) {
      setSubmitError(errorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-aside">
        <Link
          className="brand brand--light"
          to="/"
          aria-label={`${clientEnv.businessName}, inicio`}
        >
          <BrandLogo className="brand-logo--login" decorative />
        </Link>
        <div>
          <span className="eyebrow">Panel privado</span>
          <h1>
            El día en orden.
            <br />
            El servicio primero.
          </h1>
          <p>Gestiona reservas, clientes y el estado de cada cita desde un solo lugar.</p>
        </div>
      </section>
      <section className="login-card" aria-labelledby="login-title">
        <span className="summary-icon">
          <KeyRound size={22} />
        </span>
        <h2 id="login-title">Bienvenido de vuelta</h2>
        <p>Ingresa tus credenciales de administrador.</p>
        {submitError && <Alert tone="error">{submitError}</Alert>}
        <form className="form-stack" onSubmit={handleSubmit(submit)}>
          <label className="field">
            <span>Correo</span>
            <input
              autoComplete="username"
              type="email"
              placeholder="admin@negocio.com"
              {...register('email')}
            />
            {errors.email && <small className="field-error">{errors.email.message}</small>}
          </label>
          <label className="field">
            <span>Contraseña</span>
            <input autoComplete="current-password" type="password" {...register('password')} />
            {errors.password && <small className="field-error">{errors.password.message}</small>}
          </label>
          <button
            className="button button--primary button--wide"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? <Spinner label="Ingresando" /> : 'Ingresar al panel'}
          </button>
        </form>
        <Link className="text-link login-back" to="/">
          ← Volver a reservas
        </Link>
      </section>
    </main>
  );
}
