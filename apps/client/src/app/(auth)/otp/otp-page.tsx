import { CardAuthLayout } from "@/components/auth/components/card-auth-layout";
import { OtpForm } from "@/components/auth/components/otp-form";

export default function OtpPage() {
  return (
    <CardAuthLayout title="Connexion avec un code de vérification">
      <OtpForm />
    </CardAuthLayout>
  );
}
