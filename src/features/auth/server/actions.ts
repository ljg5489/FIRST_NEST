"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { isLegalOperatorConfigured } from "@/features/legal/config";
import { getSupabaseAdmin } from "@/services/supabase/admin";
import {
  type AuthActionState,
  PASSWORD_MIN_LENGTH,
  PRIVACY_VERSION,
  TERMS_VERSION,
} from "../constants";
import { getSafeNextPath, getSiteUrl } from "./redirect";

function readText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePassword(password: string, confirmation?: string) {
  if (password.length < PASSWORD_MIN_LENGTH) {
    return `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상이어야 합니다.`;
  }

  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return "비밀번호에는 영문과 숫자를 각각 하나 이상 포함해 주세요.";
  }

  if (confirmation !== undefined && password !== confirmation) {
    return "비밀번호 확인이 일치하지 않습니다.";
  }

  return null;
}

function getLoginErrorMessage(message: string) {
  const normalized = message.toLowerCase();

  if (normalized.includes("email not confirmed")) {
    return "이메일 확인을 완료한 뒤 로그인해 주세요.";
  }

  if (normalized.includes("too many") || normalized.includes("rate limit")) {
    return "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.";
  }

  return "이메일 또는 비밀번호를 확인해 주세요.";
}

export async function loginAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readText(formData, "email").toLowerCase();
  const password = readText(formData, "password");
  const next = getSafeNextPath(formData.get("next"));

  if (!isValidEmail(email) || !password) {
    return {
      status: "error",
      message: "올바른 이메일과 비밀번호를 입력해 주세요.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { status: "error", message: getLoginErrorMessage(error.message) };
  }

  revalidatePath("/", "layout");
  redirect(next);
}

export async function signupAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readText(formData, "email").toLowerCase();
  const password = readText(formData, "password");
  const passwordConfirmation = readText(formData, "passwordConfirmation");
  const isAgeConfirmed = formData.get("ageConfirmed") === "on";
  const areTermsAccepted = formData.get("termsAccepted") === "on";
  const isPrivacyAccepted = formData.get("privacyAccepted") === "on";

  if (!isValidEmail(email)) {
    return { status: "error", message: "올바른 이메일을 입력해 주세요." };
  }

  const passwordError = validatePassword(password, passwordConfirmation);
  if (passwordError) {
    return { status: "error", message: passwordError };
  }

  if (!isAgeConfirmed) {
    return {
      status: "error",
      message:
        "현재는 법정대리인 동의 절차가 없어 만 14세 이상만 가입할 수 있습니다.",
    };
  }

  if (!areTermsAccepted || !isPrivacyAccepted) {
    return {
      status: "error",
      message: "이용약관과 개인정보 처리방침에 모두 동의해 주세요.",
    };
  }

  if (process.env.NODE_ENV === "production" && !isLegalOperatorConfigured()) {
    return {
      status: "error",
      message:
        "서비스 운영자와 개인정보 문의처 설정이 완료되지 않아 현재 가입할 수 없습니다.",
    };
  }

  const supabase = await createServerSupabaseClient();
  const emailRedirectTo = `${getSiteUrl()}/auth/confirm?next=${encodeURIComponent(
    "/account",
  )}`;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo,
      data: {
        terms_accepted: true,
        terms_version: TERMS_VERSION,
        privacy_accepted: true,
        privacy_version: PRIVACY_VERSION,
        age_14_or_over: true,
      },
    },
  });

  if (error) {
    const isRateLimited =
      error.message.toLowerCase().includes("rate limit") ||
      error.message.toLowerCase().includes("too many");

    return {
      status: "error",
      message: isRateLimited
        ? "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요."
        : "회원가입을 완료하지 못했습니다. 입력 내용을 확인해 주세요.",
    };
  }

  if (data.session) {
    revalidatePath("/", "layout");
    redirect("/account");
  }

  redirect("/signup/check-email");
}

export async function requestPasswordResetAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const email = readText(formData, "email").toLowerCase();

  if (!isValidEmail(email)) {
    return { status: "error", message: "올바른 이메일을 입력해 주세요." };
  }

  const supabase = await createServerSupabaseClient();
  const redirectTo = `${getSiteUrl()}/auth/confirm?next=${encodeURIComponent(
    "/reset-password",
  )}`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error && error.message.toLowerCase().includes("rate limit")) {
    return {
      status: "error",
      message: "요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.",
    };
  }

  // 가입 여부를 노출하지 않기 위해 항상 같은 안내를 표시합니다.
  return {
    status: "success",
    message:
      "가입된 이메일이라면 비밀번호 재설정 링크가 전송됩니다. 받은편지함을 확인해 주세요.",
  };
}

export async function updatePasswordAction(
  _previousState: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const password = readText(formData, "password");
  const passwordConfirmation = readText(formData, "passwordConfirmation");
  const passwordError = validatePassword(password, passwordConfirmation);

  if (passwordError) {
    return { status: "error", message: passwordError };
  }

  const supabase = await createServerSupabaseClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims?.sub) {
    return {
      status: "error",
      message: "재설정 링크가 만료됐습니다. 새 링크를 요청해 주세요.",
    };
  }

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return {
      status: "error",
      message: "비밀번호를 변경하지 못했습니다. 새 링크로 다시 시도해 주세요.",
    };
  }

  revalidatePath("/", "layout");
  redirect("/account?password=updated");
}

export async function recordCurrentConsentAction(formData: FormData) {
  const isAgeConfirmed = formData.get("ageConfirmed") === "on";
  const areTermsAccepted = formData.get("termsAccepted") === "on";
  const isPrivacyAccepted = formData.get("privacyAccepted") === "on";

  if (!isAgeConfirmed || !areTermsAccepted || !isPrivacyAccepted) {
    redirect("/account?error=consent");
  }

  const supabase = await createServerSupabaseClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    redirect("/login?next=/account");
  }

  const acceptedAt = new Date().toISOString();
  let saveFailed = false;

  try {
    const admin = getSupabaseAdmin();
    const { error } = await admin.from("user_consents").upsert(
      {
        user_id: userId,
        terms_version: TERMS_VERSION,
        privacy_version: PRIVACY_VERSION,
        terms_accepted_at: acceptedAt,
        privacy_accepted_at: acceptedAt,
        age_14_or_over_confirmed_at: acceptedAt,
        consent_source: "reconsent",
      },
      {
        onConflict: "user_id,terms_version,privacy_version",
        ignoreDuplicates: true,
      },
    );

    if (error) {
      saveFailed = true;
    }
  } catch {
    saveFailed = true;
  }

  if (saveFailed) {
    redirect("/account?error=consent-save");
  }

  revalidatePath("/account");
  redirect("/account?consent=recorded");
}
