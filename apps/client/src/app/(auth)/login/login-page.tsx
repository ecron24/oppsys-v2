import { LoginForm } from "@/components/auth/components/login-form";
import { CardAuthLayout } from "@/components/auth/components/card-auth-layout";

export default function LoginPage() {
  return (
    <CardAuthLayout title="Connectez-vous à votre compte">
      <LoginForm />
    </CardAuthLayout>
  );
}
