const EMAIL_LOCAL_PART_PATTERN = /^[A-Z0-9!#$%&'*+/=?^_`{|}~.-]+$/i;
const EMAIL_DOMAIN_LABEL_PATTERN = /^[A-Z0-9](?:[A-Z0-9-]{0,61}[A-Z0-9])?$/i;

export function isValidEmailFormat(value: string) {
  const email = value.trim();

  if (!email || email.length > 254) {
    return false;
  }

  const parts = email.split("@");
  if (parts.length !== 2) {
    return false;
  }

  const [localPart, domain] = parts;
  if (
    !localPart ||
    localPart.length > 64 ||
    localPart.startsWith(".") ||
    localPart.endsWith(".") ||
    localPart.includes("..") ||
    !EMAIL_LOCAL_PART_PATTERN.test(localPart)
  ) {
    return false;
  }

  const domainLabels = domain.split(".");
  return (
    domain.length <= 253 &&
    domainLabels.length >= 2 &&
    domainLabels.every((label) => EMAIL_DOMAIN_LABEL_PATTERN.test(label))
  );
}
