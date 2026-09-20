"use client";

import { useState } from "react";
import {useI18n} from "@/features/i18n/I18nProvider";

export function DeleteAccountForm() {
  const {t,locale}=useI18n();
  const [confirmation, setConfirmation] = useState("");
  const confirmationWord = locale === 'ko' ? '탈퇴' : 'DELETE';

  return (
    <form action="/auth/delete-account" method="post" className="mt-4 grid gap-3">
      <label className="grid gap-2 text-sm font-bold">
        {t('계속하려면 아래에 탈퇴를 입력하세요.')} <strong>{confirmationWord}</strong>
        <input type="hidden" name="confirmation" value="탈퇴" />
        <input
          className="field-control"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          autoComplete="off"
          required
        />
      </label>
      <button
        type="submit"
        disabled={confirmation !== confirmationWord}
        className="inline-flex min-h-11 items-center justify-center rounded-md border border-[#b9432f] px-5 py-3 text-sm font-black text-[#9f321f] transition hover:bg-[#fff0ed] disabled:cursor-not-allowed disabled:opacity-40"
        onClick={(event) => {
          if (!window.confirm(t("계정과 저장한 코스를 모두 삭제할까요? 이 작업은 되돌릴 수 없습니다."))) {
            event.preventDefault();
          }
        }}
      >
        {t('계정 영구 삭제')}
      </button>
    </form>
  );
}
