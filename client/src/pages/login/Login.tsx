import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Card } from "../../components/atoms/card";
import { AuthForm, AuthScreen } from "../../components/molecules/auth-form";
import { useAuthStore } from "../../store/useAuthStore.ts";

export function Login() {
  const navigate = useNavigate();
  const { user, ready, error, signIn } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  if (ready && user) {
    return <Navigate to="/applications" replace />;
  }

  return (
    <AuthScreen>
      <Card>
        <AuthForm
          mode="login"
          title="Welcome back"
          description="Sign in to your Vortex workspace."
          submitLabel="Sign in"
          error={error}
          loading={submitting}
          footer={
            <>
              New here? <Link to="/signup">Create an account</Link>
            </>
          }
          onSubmit={async ({ email, password }) => {
            setSubmitting(true);
            try {
              await signIn(email, password);
              navigate("/applications", { replace: true });
            } finally {
              setSubmitting(false);
            }
          }}
        />
      </Card>
    </AuthScreen>
  );
}
