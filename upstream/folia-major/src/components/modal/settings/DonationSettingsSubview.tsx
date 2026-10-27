import React from 'react';
import { useTranslation } from 'react-i18next';
import donationQrUrl from '../../../assets/donation-qr.jpg';

// src/components/modal/settings/DonationSettingsSubview.tsx
// Support the independent port with the developer's original appreciation code.

const DonationSettingsSubview: React.FC<{ settingsCardClass: string }> = ({ settingsCardClass }) => {
    const { t } = useTranslation();

    return (
        <section className={`rounded-xl border p-4 sm:p-6 space-y-5 ${settingsCardClass}`}>
            <p className="text-sm leading-7 text-center" style={{ color: 'var(--text-primary)' }}>
                {t('options.donationMessage')}
            </p>
            <img
                src={donationQrUrl}
                alt={t('options.donationQrAlt')}
                width={1152}
                height={1152}
                draggable={false}
                className="block w-full max-w-[360px] h-auto mx-auto rounded-xl"
            />
        </section>
    );
};

export default DonationSettingsSubview;
