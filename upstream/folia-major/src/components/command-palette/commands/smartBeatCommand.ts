import { defineCommand } from '../commandFactories';
import { useSmartBeatStore } from '../../../stores/useSmartBeatStore';
import { probeSmartBeat } from '../../../services/beatFx/smartBeatClient';

// src/components/command-palette/commands/smartBeatCommand.ts
// The same worker probe as the settings panel; unsupported devices can only use stored beat lists.
export const smartBeatCommand = defineCommand({
    id: 'smart-beat-mode', group: 'visualizer', title: 'Smart beat mode',
    description: 'Cycle off, stored results only and on-device beat analysis',
    keywords: ['rhythm analysis', '智能动感', '节拍分析', '随拍开花', '随拍推镜'],
    execute: async () => {
        const available = await probeSmartBeat();
        useSmartBeatStore.setState({ available });
        const { settings, setMode } = useSmartBeatStore.getState();
        setMode(settings.mode === 'off' ? 'cached' : settings.mode === 'cached' && available ? 'on' : 'off');
        return true;
    },
});
