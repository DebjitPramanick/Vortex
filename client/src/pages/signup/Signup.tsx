import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Card } from "@components/atoms/card";
import { AuthForm, AuthScreen } from "@components/molecules/auth-form";
import { useAuthStore } from "@store/useAuthStore";

export function Signup() {
  const navigate = useNavigate();
  const { user, ready, error, signUp } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  if (ready && user) {
    return <Navigate to="/applications" replace />;
  }

  return (
    <AuthScreen>
      <Card>
        <AuthForm
          mode="signup"
          title="Create account"
          description="Start tracking your job search in Vortex."
          submitLabel="Create account"
          error={error}
          loading={submitting}
          footer={
            <>
              Already have an account? <Link to="/login">Sign in</Link>
            </>
          }
          onSubmit={async ({ email, password }) => {
            setSubmitting(true);
            try {
              await signUp(email, password);
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
