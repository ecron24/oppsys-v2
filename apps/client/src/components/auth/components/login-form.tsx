export function LoginForm({ onEmailChange }: LoginFormProps) {
  void onEmailChange;
  return <>LoginForm</>;
}

type LoginFormProps = {
  onEmailChange?: (email: string) => void;
};
