export function getPasswordStrength(password: string): {
  score: number;
  issues: string[];
} {
  let score = 0;
  const issues: string[] = [];

  if (password.length >= 8) score++;
  else issues.push("Au moins 8 caractères");

  if (/[A-Z]/.test(password)) score++;
  else issues.push("Une majuscule");

  if (/[0-9]/.test(password)) score++;
  else issues.push("Un chiffre");

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
  else issues.push("Un caractère spécial");

  return { score, issues };
}
