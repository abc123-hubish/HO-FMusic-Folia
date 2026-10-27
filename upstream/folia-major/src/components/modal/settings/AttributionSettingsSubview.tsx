import React from 'react';
import { BookOpen, ExternalLink, Heart, Scale, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';

// src/components/modal/settings/AttributionSettingsSubview.tsx
// Credit the upstream project and explain the independently maintained HarmonyOS port.

const UPSTREAM_URL = 'https://github.com/chthollyphile/folia-major';
const PORT_URL = 'https://github.com/abc123-hubish/HO-FMusic-Folia/';

const AttributionSettingsSubview: React.FC<{ settingsCardClass: string }> = ({ settingsCardClass }) => {
    const { t } = useTranslation();
    const cardClass = `rounded-xl border p-4 sm:p-6 space-y-3 ${settingsCardClass}`;
    const linkClass = 'inline-flex max-w-full items-center gap-2 rounded-lg text-sm underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4';

    return (
        <div className="space-y-4" data-settings-attribution>
            <section className={cardClass}>
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <BookOpen size={18} aria-hidden="true" />{t('options.attributionUpstream')}
                </h3>
                <p className="text-sm leading-7 opacity-75">{t('options.attributionUpstreamDesc')}</p>
                <dl className="space-y-2 text-sm">
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                        <dt className="opacity-60">{t('options.attributionProject')}</dt><dd>Folia</dd>
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1">
                        <dt className="opacity-60">{t('options.attributionAuthor')}</dt><dd>chthollyphile</dd>
                    </div>
                </dl>
                <a className={linkClass} href={UPSTREAM_URL} target="_blank" rel="noopener noreferrer">
                    <span className="min-w-0 break-all">chthollyphile/folia-major</span>
                    <ExternalLink size={14} className="shrink-0" aria-hidden="true" />
                </a>
            </section>
            <section className={cardClass}>
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Smartphone size={18} aria-hidden="true" />{t('options.attributionPort')}
                </h3>
                <p className="text-sm leading-7 opacity-75">{t('options.attributionPortDesc')}</p>
                <p className="text-sm leading-7 opacity-75">{t('options.attributionPortScope')}</p>
                <div className="space-y-2">
                    <p className="text-sm opacity-60">{t('options.attributionPortRepository')}</p>
                    <a className={linkClass} href={PORT_URL} target="_blank" rel="noopener noreferrer">
                        <span className="min-w-0 break-all">abc123-hubish/HO-FMusic-Folia</span>
                        <ExternalLink size={14} className="shrink-0" aria-hidden="true" />
                    </a>
                </div>
                <p className="text-sm leading-7 opacity-60">{t('options.attributionPortNotice')}</p>
            </section>
            <section className={cardClass}>
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Scale size={18} aria-hidden="true" />{t('options.attributionLicense')}
                </h3>
                <p className="text-sm leading-7 opacity-75">{t('options.attributionLicenseDesc')}</p>
                <a className={linkClass} href={`${UPSTREAM_URL}/blob/main/LICENSE`} target="_blank" rel="noopener noreferrer">
                    <span>{t('options.attributionViewLicense')}</span>
                    <ExternalLink size={14} className="shrink-0" aria-hidden="true" />
                </a>
                <p className="flex items-start gap-2 text-sm leading-7 opacity-75">
                    <Heart size={16} className="mt-1.5 shrink-0" aria-hidden="true" />
                    <span>{t('options.attributionThanks')}</span>
                </p>
                <a className={linkClass} href={`${UPSTREAM_URL}/blob/main/CONTRIBUTORS.md`} target="_blank" rel="noopener noreferrer">
                    <span>{t('options.attributionContributors')}</span>
                    <ExternalLink size={14} className="shrink-0" aria-hidden="true" />
                </a>
            </section>
        </div>
    );
};

export default AttributionSettingsSubview;
