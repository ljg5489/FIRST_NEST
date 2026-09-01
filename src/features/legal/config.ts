export const legalOperator = {
  name: process.env.SERVICE_OPERATOR_NAME?.trim() || "FIRST NEST 프로젝트팀",
  privacyContact:
    process.env.PRIVACY_CONTACT_EMAIL?.trim() || "배포 전 개인정보 문의 이메일 설정 필요",
};

export function isLegalOperatorConfigured() {
  return Boolean(
    process.env.SERVICE_OPERATOR_NAME?.trim() &&
      process.env.PRIVACY_CONTACT_EMAIL?.trim(),
  );
}
