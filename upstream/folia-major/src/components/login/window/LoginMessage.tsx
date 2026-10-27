import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppWindow, ChevronDown, Loader2, QrCode, Smartphone, User, type LucideIcon } from 'lucide-react';
import { Button, Segmented } from '../../modal/settings/kit';
import { useKitReducedMotion } from '../../modal/settings/kit/motion';
import type { StepMark } from './loginView';

// src/components/login/window/LoginMessage.tsx
// Upstream message layout; retry availability and failure classification come from the existing controller.
export type MessageAction = {
    label: string;
    onClick: () => void;
    primary?: boolean;
    busy?: boolean;
    disabled?: boolean;
};

type LoginMessageProps = {
    /** 换了样子就换一个值：标题和那一行据此重新出现一次。 */
    sceneKey: string;
    headline: string;
    note?: string;
    /** 平台或者本地服务自己的话。 */
    quote?: { who: string; text: string; code?: string };
    /** 登录方式：一个分段的选择，选了之后还留着，可以再换。 */
    methods?: { options: Array<{ value: string; label: string; icon: string }>; value: string | null; onChange: (id: string) => void };
    actions: MessageAction[];
    /** 「稍后再试」：按钮先倒数到这一种失败等完的时刻，再变成第一个操作。 */
    /** 有「详情」可以展开：它开没开，和点它时做什么。展开的内容由窗口画在下面。 */
    details?: { open: boolean; onToggle: () => void };
    steps?: { marks: StepMark[]; current: number } | null;
};

const STEP_ICON: Record<StepMark, LucideIcon> = { code: QrCode, browser: AppWindow, phone: Smartphone, account: User };

const StepMarks: React.FC<{ marks: StepMark[]; current: number }> = ({ marks, current }) => (
    <div aria-hidden className="login-fade ml-auto flex shrink-0 items-center self-end">
        {marks.map((mark, index) => {
            const Icon = STEP_ICON[mark];
            const done = index < current;
            return (
                <React.Fragment key={mark}>
                    {index > 0 && (
                        <span className="relative h-[1.5px] w-[26px] bg-[var(--st-line2)]">
                            <span
                                className="st-t-unfold absolute inset-0 origin-left bg-[var(--login-pc)] transition-transform"
                                style={{ transform: index <= current ? 'none' : 'scaleX(0)' }}
                            />
                        </span>
                    )}
                    <span
                        className={`st-t-move relative grid h-[26px] w-[26px] place-items-center rounded-full transition-colors ${index === current ? 'login-step-current text-[color:var(--st-t1)]' : done ? '' : 'text-[color:var(--st-t3)]'}`}
                        style={done
                            ? { background: 'var(--login-pc)', color: 'var(--login-on-pc)' }
                            : { boxShadow: `inset 0 0 0 1.5px ${index === current ? 'var(--login-pc)' : 'var(--st-line2)'}` }}
                    >
                        <Icon size={13} />
                    </span>
                </React.Fragment>
            );
        })}
    </div>
);

export const LoginMessage: React.FC<LoginMessageProps> = ({ sceneKey, headline, note, quote, methods, actions, details, steps }) => {
    const { t } = useTranslation();
    const reduced = useKitReducedMotion();
    const [first, ...rest] = actions;

    return (
        <div className="login-message flex min-w-0 flex-1 flex-col">
            {methods && (
                <div className="mb-4 self-start">
                    <Segmented
                        value={methods.value ?? ''}
                        options={methods.options.map(option => ({
                            value: option.value,
                            label: option.label,
                            icon: option.icon ? <img src={option.icon} alt="" draggable={false} className="h-4 w-4" /> : undefined,
                        }))}
                        onChange={methods.onChange}
                    />
                </div>
            )}
            <div key={sceneKey} className="login-in min-w-0 flex-1">
                <h3 className="text-xl font-semibold leading-7 [overflow-wrap:anywhere] [text-wrap:balance]">{headline}</h3>
                {note && <p className="mt-1.5 whitespace-pre-line text-[13px] leading-5 text-[color:var(--st-t2)] [overflow-wrap:anywhere]">{note}</p>}
                {quote && (
                    <div className="mt-3 flex select-text items-baseline gap-2 rounded-lg bg-[var(--st-fill)] px-2.5 py-2 text-xs leading-[18px] text-[color:var(--st-t2)]">
                        <b className="shrink-0 font-semibold text-[color:var(--st-t1)]">{quote.who}</b>
                        <span className="min-w-0 flex-1 [overflow-wrap:anywhere]">{quote.text}</span>
                        {quote.code && <code className="shrink-0 font-mono text-[color:var(--st-t3)]">{quote.code}</code>}
                    </div>
                )}
            </div>
            <div className="mt-4 flex min-h-8 flex-wrap items-center gap-2">
                {first && <Button variant={first.primary ? 'primary' : undefined} onClick={first.onClick} disabled={first.busy || first.disabled}>
                    {first.busy && <Loader2 size={14} className={reduced ? undefined : 'animate-spin'} />}{first.label}
                </Button>}
                {rest.map(action => (
                    <Button key={action.label} variant={action.primary ? 'primary' : undefined} onClick={action.onClick} disabled={action.busy}>{action.label}</Button>
                ))}
                {details && (
                    <button
                        type="button"
                        aria-expanded={details.open}
                        onClick={details.onToggle}
                        className="st-t-fast inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[13px] text-[color:var(--st-t2)] transition-colors hover:bg-[var(--st-fill)] hover:text-[color:var(--st-t1)]"
                    >
                        {t('login.details')}
                        <ChevronDown size={14} className={`st-t-move transition-transform ${details.open ? 'rotate-180' : ''}`} />
                    </button>
                )}
                {steps && <StepMarks marks={steps.marks} current={steps.current} />}
            </div>
        </div>
    );
};


export default LoginMessage;
