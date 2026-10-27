import React from 'react';
import type { ProbeDefinition } from './definition';
import HarmonyAiSettings from '../../src/harmony/HarmonyAiSettings';
import HarmonyServiceSettings from '../../src/harmony/HarmonyServiceSettings';

// Exercise the real connection cards using the native mock installed by the browser test.
const HarmonyAiProbe = () => (
  <div style={{ maxWidth: 640, margin: '16px auto', padding: 16, color: '#eeeeee', background: '#202022' }}>
    <HarmonyServiceSettings cardClass="border-white/10 bg-white/5">
      <HarmonyAiSettings cardClass="border-white/10 bg-white/5" isDaylight={false} />
    </HarmonyServiceSettings>
  </div>
);
const definition: ProbeDefinition = { id: 'harmonyAi', title: 'HarmonyOS AI connection', description: 'User AI configuration and native connection test', Component: HarmonyAiProbe };
export default definition;
