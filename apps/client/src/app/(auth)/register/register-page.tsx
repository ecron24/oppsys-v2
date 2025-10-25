import { CardAuthLayout } from "@/components/auth/components/card-auth-layout";
import { RegisterForm } from "@/components/auth/components/register-form";

export default function RegisterPage() {
  return (
    <CardAuthLayout title="Créez votre compte">
      <RegisterForm />
    </CardAuthLayout>
  );
}
