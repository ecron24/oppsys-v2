import { useState } from "react";
import { OtpVerifyCodeForm } from "./otp-verify-code-form";
import { OtpEmailForm } from "./otp-email-form";

export function OtpForm({ defaultEmail, onBack }: OtpFormProps) {
  const [currentEmail, setCurrentEmail] = useState(defaultEmail);

  if (currentEmail) {
    return <OtpVerifyCodeForm email={currentEmail} onBack={onBack} />;
  }

  return (
    <OtpEmailForm
      onSent={({ email }) => setCurrentEmail(email)}
      onBack={onBack}
    />
  );
}

type OtpFormProps = {
  defaultEmail?: string;
  onBack: () => void;
};
