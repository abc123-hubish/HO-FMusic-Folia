import { useEffect, useState } from 'react';
import { Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import SettingsSectionHeading from '../components/modal/settings/navigation/SettingsSectionHeading';
import SettingsRow, { SettingsToggle } from '../components/modal/settings/SettingsRow';
import { settingsDividerClassFor, settingsToggleOffClassFor } from '../components/modal/settings/settingsCardClasses';
import { getHarmonyKeepScreenOn, getHarmonyPortraitMode, hasHarmonyKeepScreenOn, hasHarmonyOrientation, setHarmonyKeepScreenOn, setHarmonyPortraitMode } from './display';

// The native host applies and persists the screen settings; rows share the options panel's controls.
export default function HarmonyDisplaySettings({ cardClass, isDaylight, onColor }: { cardClass: string; isDaylight: boolean; onColor?: string }) {
  const { t } = useTranslation();
  const [portrait, setPortrait] = useState(getHarmonyPortraitMode);
  const [pending, setPending] = useState(false);
  const [keepScreenOn, setKeepScreenOn] = useState(getHarmonyKeepScreenOn);
  const [screenPending, setScreenPending] = useState(false);
  useEffect(() => {
    const update = () => { setPortrait(getHarmonyPortraitMode()); setPending(false); };
    const updateScreen = () => { setKeepScreenOn(getHarmonyKeepScreenOn()); setScreenPending(false); };
    window.addEventListener('harmonyorientationchange', update);
    window.addEventListener('harmonykeepscreenonchange', updateScreen);
    return () => {
      window.removeEventListener('harmonyorientationchange', update);
      window.removeEventListener('harmonykeepscreenonchange', updateScreen);
    };
  }, []);
  if (!hasHarmonyOrientation()) return null;
  const hasKeepScreenOn = hasHarmonyKeepScreenOn();
  const dividerClass = settingsDividerClassFor(isDaylight);
  const offClass = settingsToggleOffClassFor(isDaylight);
  return (
    <section data-harmony-orientation data-harmony-screen-settings>
      <SettingsSectionHeading icon={Smartphone} label={t('harmony.orientation')} />
      <div className={`rounded-xl border overflow-hidden ${cardClass}`}>
        <SettingsRow title={t('harmony.portrait')} description={t('harmony.orientationHint')}
          dividerClass={dividerClass} isLast={!hasKeepScreenOn}
          control={<SettingsToggle checked={portrait} disabled={pending} ariaLabel={t('harmony.portrait')}
            offClass={offClass} onColor={onColor}
            onChange={() => { setPending(true); setHarmonyPortraitMode(!portrait); }} />} />
        {hasKeepScreenOn && <SettingsRow title={t('harmony.keepScreenOn')} description={t('harmony.keepScreenOnHint')}
          dividerClass={dividerClass} isLast
          control={<SettingsToggle checked={keepScreenOn} disabled={screenPending} ariaLabel={t('harmony.keepScreenOn')}
            offClass={offClass} onColor={onColor}
            onChange={() => { setScreenPending(true); setHarmonyKeepScreenOn(!keepScreenOn); }} />} />}
      </div>
    </section>
  );
}
