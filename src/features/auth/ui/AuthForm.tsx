"use client";

import Link from "next/link";
import { useActionState } from "react";
import { initialAuthActionState } from "../constants";
import {
  loginAction,
  requestPasswordResetAction,
  signupAction,
  updatePasswordAction,
} from "../server/actions";

type AuthFormMode = "login" | "signup" | "forgot-password" | "reset-password";

type AuthFormProps = {
  mode: AuthFormMode;
  next?: string;
};

const modeConfig = {
  login: {
    submitLabel: "로그인",
    pendingLabel: "로그인 중...",
  },
  signup: {
    submitLabel: "회원가입",
    pendingLabel: "가입 처리 중...",
  },
  "forgot-password": {
    submitLabel: "재설정 메일 보내기",
    pendingLabel: "메일 전송 중...",
  },
  "reset-password": {
    submitLabel: "새 비밀번호 저장",
    pendingLabel: "변경 중...",
  },
} as const;

export function AuthForm({ mode, next = "/account" }: AuthFormProps) {
  const action =
    mode === "login"
      ? loginAction
      : mode === "signup"
        ? signupAction
        : mode === "forgot-password"
          ? requestPasswordResetAction
          : updatePasswordAction;
  const [state, formAction, isPending] = useActionState(
    action,
    initialAuthActionState,
  );
  const config = modeConfig[mode];
  const needsEmail = mode !== "reset-password";
  const needsPassword = mode === "login" || mode === "signup" || mode === "reset-password";
  const needsPasswordConfirmation = mode === "signup" || mode === "reset-password";

  return (
    <form action={formAction} className="grid gap-4">
      {mode === "login" ? <input type="hidden" name="next" value={next} /> : null}

      {needsEmail ? (
        <label className="grid gap-2 text-sm font-bold">
          이메일
          <input
            className="field-control"
            type="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder="name@example.com"
            required
          />
        </label>
      ) : null}

      {needsPassword ? (
        <label className="grid gap-2 text-sm font-bold">
          {mode === "reset-password" ? "새 비밀번호" : "비밀번호"}
          <input
            className="field-control"
            type="password"
            name="password"
            minLength={8}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder="영문·숫자 포함 8자 이상"
            required
          />
        </label>
      ) : null}

      {needsPasswordConfirmation ? (
        <label className="grid gap-2 text-sm font-bold">
          비밀번호 확인
          <input
            className="field-control"
            type="password"
            name="passwordConfirmation"
            minLength={8}
            autoComplete="new-password"
            required
          />
        </label>
      ) : null}

      {mode === "signup" ? (
        <fieldset className="grid gap-3 rounded-lg border border-[#dce2d7] bg-[#f7f8f5] p-4">
          <legend className="px-1 text-sm font-black">필수 확인 및 동의</legend>
          <label className="flex items-start gap-3 text-sm leading-6 text-[#3d4941]">
            <input className="mt-1" type="checkbox" name="ageConfirmed" required />
            <span>만 14세 이상입니다.</span>
          </label>
          <label className="flex items-start gap-3 text-sm leading-6 text-[#3d4941]">
            <input className="mt-1" type="checkbox" name="termsAccepted" required />
            <span>
              <Link className="font-bold text-[#174d3c] underline" href="/terms" target="_blank">
                이용약관
              </Link>
              에 동의합니다.
            </span>
          </label>
          <label className="flex items-start gap-3 text-sm leading-6 text-[#3d4941]">
            <input className="mt-1" type="checkbox" name="privacyAccepted" required />
            <span>
              <Link className="font-bold text-[#174d3c] underline" href="/privacy" target="_blank">
                개인정보 처리방침
              </Link>
              을 확인하고 동의합니다.
            </span>
          </label>
          <p className="text-xs leading-5 text-[#667165]">
            현재는 만 14세 미만 아동의 법정대리인 동의 확인 절차를 제공하지 않습니다.
          </p>
        </fieldset>
      ) : null}

      {state.message ? (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`rounded-md px-4 py-3 text-sm leading-6 ${
            state.status === "error"
              ? "bg-[#fff0ed] text-[#9f321f]"
              : "bg-[#e8f1eb] text-[#174d3c]"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <button type="submit" className="primary-button w-full border-0" disabled={isPending}>
        {isPending ? config.pendingLabel : config.submitLabel}
      </button>

      {mode === "login" ? (
        <div className="flex flex-wrap justify-between gap-3 text-sm font-semibold text-[#5d675f]">
          <Link href="/signup" className="hover:text-[#174d3c]">회원가입</Link>
          <Link href="/forgot-password" className="hover:text-[#174d3c]">비밀번호 찾기</Link>
        </div>
      ) : null}

      {mode === "signup" || mode === "forgot-password" ? (
        <p className="text-center text-sm text-[#5d675f]">
          이미 계정이 있나요?{" "}
          <Link href="/login" className="font-black text-[#174d3c]">로그인</Link>
        </p>
      ) : null}
    </form>
  );
}
