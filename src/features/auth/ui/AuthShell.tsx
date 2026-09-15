import Link from 'next/link';
import type { ReactNode } from 'react';

export function AuthShell({ mode, children }: { mode: 'login' | 'signup'; children: ReactNode }) {
  const signup = mode === 'signup';
  return <main className="auth-main"><div className="auth-split">
    <aside className="auth-story">
      <p className="auth-eyebrow">A LITTLE CLOSER, TOGETHER</p>
      <h2>함께라서 더 좋은,<br/>우리의 다음 여행.</h2>
      <p>발길 닿는 곳마다 새로운 이야기.<br/>나만의 여행을 여기서 시작해 보세요.</p>
      <div className="auth-landscape" aria-hidden="true"><span className="auth-sun"/><span className="auth-hill auth-hill-back"/><span className="auth-hill auth-hill-front"/><div className="auth-travel-note"><span>YOUR NEXT JOURNEY</span><strong>설레는 여행의 시작</strong><div>충남에서 만나는 새로운 하루</div><b>travel with me ↗</b></div></div>
      <span className="auth-story-bottom">MAKE MEMORIES, ONE PLACE AT A TIME.</span>
    </aside>
    <section className="auth-panel">
      <nav className="auth-tabs" aria-label="계정 시작"><Link href="/login" aria-current={!signup?'page':undefined}>로그인</Link><Link href="/signup" aria-current={signup?'page':undefined}>회원가입</Link></nav>
      <div className="auth-heading"><p className="auth-eyebrow">{signup?'NICE TO MEET YOU':'WELCOME BACK'}</p><h1>{signup?'첫 여행을 함께 시작해요.':'다시 만나서 반가워요.'}</h1><p>{signup?'이메일로 가입하고, 나만의 여행을 모아보세요.':'저장해 둔 여행, 설레는 다음 일정을 이어가세요.'}</p></div>
      {children}
    </section>
  </div></main>;
}
