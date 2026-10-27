import { installHarmonyPlatform } from './platform';
import { installHarmonyWindowChrome } from './windowChrome';
import { installHarmonyLifecycle } from './lifecycle';
import { installHarmonyLocalCover } from './localCover';
import './mobile.css';

// Install the platform boundary before any store or provider reads its initial configuration.
if (window.FoliaNative) {
  document.documentElement.dataset.harmony = 'true';
  installHarmonyWindowChrome();
  installHarmonyLifecycle();
  installHarmonyLocalCover();
  window.HarmonyConfig = JSON.parse(window.FoliaNative.getConfig());
  if (!localStorage.getItem('harmony_initialized')) {
    if (!localStorage.getItem('folia_app_language')) localStorage.setItem('folia_app_language', 'zh-CN');
    localStorage.setItem('visualizer_frame_rate', '30');
    localStorage.setItem('playback_entry_view', 'player');
    localStorage.setItem('library_suite', 'grid');
    localStorage.setItem('harmony_initialized', 'true');
  }
  // The Harmony app opens directly into the requested library; these choices remain editable in settings.
  localStorage.setItem('library_suite_prompt_seen', 'true');
  localStorage.setItem('playback_entry_view_chosen', 'true');
  if (!localStorage.getItem('harmony_direct_home')) {
    localStorage.setItem('folia_last_seen_ponder_onboarding_version', __APP_VERSION__);
    localStorage.setItem('harmony_direct_home', 'true');
  }
  installHarmonyPlatform();
}
void import('../index');
