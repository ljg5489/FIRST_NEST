"use client";

import Link from 'next/link';
import type { ReactNode } from 'react';
import {useI18n} from '@/features/i18n/I18nProvider';

export function AuthShell({ mode, children }: { mode: 'login' | 'signup'; children: ReactNode }) {
  const signup = mode === 'signup';
  const {t}=useI18n();
  return <main className="auth-main"><div className="auth-split">
    <aside className="auth-story">
      <p className="auth-eyebrow">A LITTLE CLOSER, TOGETHER</p>
      <h2>{t('함께라서 더 좋은, 우리의 다음 여행.')}</h2>
      <p>{t('발길 닿는 곳마다 새로운 이야기. 나만의 여행을 여기서 시작해 보세요.')}</p>
      <div className="auth-landscape" aria-hidden="true"><span className="auth-sun"/><span className="auth-hill auth-hill-back"/><span className="auth-hill auth-hill-front"/><div className="auth-travel-note"><span>YOUR NEXT JOURNEY</span><strong>{t('설레는 여행의 시작')}</strong><div>{t('충남에서 만나는 새로운 하루')}</div><b>travel with me ↗</b></div></div>
      <span className="auth-story-bottom">MAKE MEMORIES, ONE PLACE AT A TIME.</span>
    </aside>
    <section className="auth-panel">
      <nav className="auth-tabs" aria-label={t('계정 시작')}><Link href="/login" aria-current={!signup?'page':undefined}>{t('로그인')}</Link><Link href="/signup" aria-current={signup?'page':undefined}>{t('회원가입')}</Link></nav>
      <div className="auth-heading"><p className="auth-eyebrow">{signup?'NICE TO MEET YOU':'WELCOME BACK'}</p><h1>{t(signup?'첫 여행을 함께 시작해요.':'다시 만나서 반가워요.')}</h1><p>{t(signup?'이메일로 가입하고, 나만의 여행을 모아보세요.':'저장해 둔 여행, 설레는 다음 일정을 이어가세요.')}</p></div>
      {children}
    </section>
  </div></main>;
}
