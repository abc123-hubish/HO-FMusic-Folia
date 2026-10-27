import React from 'react';
import { Plug } from 'lucide-react';
import { openLoginWindow } from '../../../components/login/loginWindowStore';
import type { BravaisHomeAccount } from './bravaisHomeModels';
import { closeBravaisHomePopover } from './bravaisHomeUiStore';
import BravaisProviderAvatar from './BravaisProviderAvatar';
import './bravaisAccount.css';

// src/library/suites/bravais/BravaisSeamAccountSwitcher.tsx
// 首页在线页签窄缝里的平台切换（B10，设计稿 §10.7 的 account-select / account-logout）：当前平台 + 账户状态的按钮，
// 点开是 provider 列表（当前标记、账户状态、选它会做什么），当前且已登录的那一行有登出（canLogoutProvider，登出在途时
// 禁用）。未登录（guest）时墙是空的，这里就是这个页签的登录入口。选一个平台走 account.selectProvider：能直接切的
// 缝翻成确认态，要登录的缝拉到完整宽度翻成登录态——列表随之收起。书脊上只留一个图标按钮，点它把缝展开成窄缝。
// 数据与回调都来自层描述（BravaisHomeAccount，首页在线来源投影好的），这里只排版与管列表的开合。
// fb3（用户实测：未登录时五个平台直接摊开太占地方）：未登录也不再常开列表，只显示一个「连接在线平台」入口，点了才
// 展开平台列表（行与已登录时一样：平台名、账户状态、登录到 X / 切换至 X）；再点入口或 Esc 收起。已登录时不变。
// data-bravais-account：已登录 closed / panel，未登录 guest（只有入口）/ guest-panel（列表展开）。
// 书脊上的账户按钮先把缝展开成窄缝，再经 bravaisHomeUiStore 的 openRequest 让窄缝里的列表打开。
// fb4（用户实测）：入口挪到窄缝底部、贴在工具格正上方（BravaisSeamHome），列表从按钮**往上**弹出，绝对定位盖在导航区
// 上，不推挤页签、不改变页签的缩减级别。弹出 / 收起用 framer-motion（bravaisAccountMotion：从按钮方向放大 + 位移 +
// 渐显；降低动态效果时只渐变）。再点按钮、Esc、点别处都收起。登出不再单独一行，是当前那一行右侧的小图标按钮
// （LogOut，aria-label / title 是登出文案）；行本身点击仍是选该平台。
// fb8（用户实测）：入口与列表行改成 grid 账户切换器的样子——图标 / 头像 + 名称（BravaisProviderAvatar，徽章与 grid 同一套）：
// - 入口：已登录是头像 + 昵称（没头像退回平台徽章）；无需登录的平台是徽章 + 平台名；未登录是连接图标 + 「连接在线平台」。
//   不再显示「未登录 / 未配置 / 登录到 X」之类的状态字，平台名与账户状态挪进 aria-label / title。
// - 列表行：头像 / 徽章 + 平台名，下面一行小字只留区分所必需的（昵称、「无需登录」「未配置」，与 grid 一致）；要登录才能
//   选的行尾是 LogIn 图标（同 grid），「登录到 X / 切换至 X」与完整状态进行的 aria-label / title。登出图标不变。
// - 列表与工具格的「⋯」菜单互斥：开着哪个记在 bravaisHomeUiStore 的 popover。
// 2026-10-09（用户实测：窄缝里的列表太挤）：列表改成从缝的**侧面**弹出到墙上，像 grid 的账户切换器——宽 288px、
// 行高与头像按 grid 的尺寸。挂到 .bravais-root 上（portal：缝本身 overflow: hidden，挂在缝里会被裁掉），
// 绝对定位：底边与入口底边对齐、往上长；朝缝两侧空间大的那一边弹（缝在屏幕右半边时往左）。


// 统一登录窗口取代上述历史弹出列表；保留窄缝入口的位置、昵称与头像，不再从墙侧面额外展开账号菜单。
const BravaisSeamAccountSwitcher: React.FC<{ account: BravaisHomeAccount; compact: boolean; onExpand: () => void }> = ({ account, compact }) => {
    const status = [account.providerLabel, account.detail].filter(Boolean).join(' · ');
    const label = `${account.guest ? account.connectLabel : account.toggleLabel} · ${status}`;
    const open = () => { closeBravaisHomePopover('accounts'); openLoginWindow(account.providerId); };
    const avatar = account.guest
        ? <span className="bravais-account-avatar is-connect" aria-hidden data-bravais-account-avatar="connect"><Plug /></span>
        : <BravaisProviderAvatar providerId={account.providerId} name={account.providerLabel} avatarUrl={account.avatarUrl} loginPill />;
    return <div className={`bravais-account-switcher${compact ? ' is-compact' : account.guest ? ' is-guest' : ''}`}
        data-bravais-account={account.guest ? 'guest' : 'closed'}>
        <button type="button" className={compact ? 'bravais-seam-icon bravais-account-spine' : `bravais-account-entry ${account.guest ? 'bravais-account-connect' : 'bravais-account-toggle'}`}
            data-bravais-account-toggle={compact ? 'compact' : account.guest ? 'connect' : 'strip'} aria-label={label} title={label} aria-haspopup="dialog" onClick={open}>
            {avatar}{!compact && <span className="is-name">{account.guest ? account.connectLabel : account.nickname ?? account.providerLabel}</span>}
        </button>
    </div>;
};
export default BravaisSeamAccountSwitcher;
