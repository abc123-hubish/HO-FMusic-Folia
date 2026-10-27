import React, { Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';

// src/components/shared/createDeferredComponent.tsx
// Keep optional screens out of startup, with cancellable feedback and recovery after a failed import.
class FeatureBoundary extends React.Component<{
    children: React.ReactNode;
    fallback: React.ReactNode;
}, { failed: boolean }> {
    state = { failed: false };
    static getDerivedStateFromError() { return { failed: true }; }
    componentDidCatch(error: Error) { console.error('[DeferredFeature] Failed to load screen:', error); }
    render() { return this.state.failed ? this.props.fallback : this.props.children; }
}

const LoadingFeedback: React.FC<{
    onRetry?: () => void;
    onClose?: () => void;
    isDaylight?: boolean;
}> = ({ onRetry, onClose, isDaylight }) => {
    const { t } = useTranslation();
    return (
        <div data-deferred-feature-feedback role={onRetry ? 'alert' : 'status'}
            className={`fixed inset-0 z-[210] flex items-center justify-center ${isDaylight ? 'bg-white/80 text-zinc-900' : 'bg-zinc-950/80 text-zinc-100'}`}>
            <div className="flex items-center gap-4 rounded-2xl border border-current/10 px-6 py-4">
                {onRetry
                    ? <button type="button" onClick={onRetry}>{t('options.retry', '重试')}</button>
                    : <><span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" aria-hidden="true" />{t('playlist.loading')}</>}
                {onClose && <button type="button" onClick={onClose}>{t('options.cancel', '取消')}</button>}
            </div>
        </div>
    );
};

// The factory runs at module scope. Only mounting the returned component starts the import.
export function createDeferredComponent<P extends object>(load: () => Promise<{ default: React.ComponentType<P> }>): React.FC<P & { deferredFeedbackVisible?: boolean }> {
    const Component = lazy(load);
    return function DeferredComponent({ deferredFeedbackVisible = true, ...props }) {
        const { onClose, isDaylight } = props as P & { onClose?: () => void; isDaylight?: boolean };
        // Browsers can retain failed ES-module loads. Reloading starts a fresh module map for retry.
        const failed = deferredFeedbackVisible
            ? <LoadingFeedback onRetry={() => window.location.reload()} onClose={onClose} isDaylight={isDaylight} />
            : null;
        const loading = deferredFeedbackVisible ? <LoadingFeedback onClose={onClose} isDaylight={isDaylight} /> : null;
        return (
            <FeatureBoundary fallback={failed}>
                <Suspense fallback={loading}>
                    <Component {...props as P} />
                </Suspense>
            </FeatureBoundary>
        );
    };
}
