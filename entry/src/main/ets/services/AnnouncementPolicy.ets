// Remote reminder rules and display content are independent announcement priorities.
export interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  priority: number;
  created_at: string;
  updated_at?: string;
  status?: number;
}

export interface AnnouncementApiResponse {
  code: number;
  data: AnnouncementItem[];
}

export interface AnnouncementPresentation {
  title: string;
  message: string;
  version: string;
}

export enum AnnouncementMode {
  NORMAL = 'normal',
  FORCE = 'force',
  CLOSED = 'closed'
}

export const ANNOUNCEMENT_API_URL: string = 'https://api.xxauth.com/open/v1/announcements';
export const ANNOUNCEMENT_APP_ID: string = 'b4f32302-28d0-4062-a0de-380662fa3f70';
const REMINDER_PRIORITY: number = 10;
const CONTENT_PRIORITY: number = 1;

function modeFromMarker(marker: string): AnnouncementMode {
  if (marker === '强制提醒') return AnnouncementMode.FORCE;
  return marker === '不强制' ? AnnouncementMode.NORMAL : AnnouncementMode.CLOSED;
}

// An explicit current selection takes precedence over the command examples above it.
export function parseAnnouncementMode(content: string): AnnouncementMode {
  const explicit: RegExpMatchArray | null = content.match(/当前(?:为|模式)?\s*[:：=]?\s*\/\/(强制提醒|强制关闭|不强制)/);
  if (explicit !== null) return modeFromMarker(explicit[1]);
  if (content.indexOf('//强制关闭') >= 0) return AnnouncementMode.CLOSED;
  if (content.indexOf('//强制提醒') >= 0) return AnnouncementMode.FORCE;
  return content.indexOf('//不强制') >= 0 ? AnnouncementMode.NORMAL : AnnouncementMode.CLOSED;
}

function timestamp(item: AnnouncementItem): number {
  return Date.parse(item.updated_at || item.created_at) || 0;
}

function isActive(item: AnnouncementItem): boolean {
  return item !== null && item !== undefined && (item.status === undefined || item.status === 1);
}

function displayContent(content: string): string {
  return content.split('//提醒').join('').split('//关闭').join('').trim();
}

// Only priority 1 enters the dialog; priority 10 controls whether it may open.
export function buildAnnouncementPresentation(items: AnnouncementItem[], currentVersion: string,
  mutedVersion: string): AnnouncementPresentation | null {
  let rule: AnnouncementItem | null = null;
  const announcements: AnnouncementItem[] = [];
  for (const item of items) {
    if (!isActive(item) || typeof item.content !== 'string') continue;
    if (item.priority === REMINDER_PRIORITY && item.content.trim().length > 0) {
      if (rule === null || timestamp(item) > timestamp(rule)) rule = item;
    } else if (item.priority === CONTENT_PRIORITY) {
      const title: string = typeof item.title === 'string' ? item.title.trim() : '';
      const content: string = displayContent(item.content);
      if (!title && !content) continue;
      announcements.push({ id: item.id, title: title || '公告', content: content,
        priority: item.priority, created_at: item.created_at, updated_at: item.updated_at });
    }
  }
  if (rule === null || announcements.length === 0) return null;
  const mode: AnnouncementMode = parseAnnouncementMode(rule.content);
  if (mode === AnnouncementMode.CLOSED ||
    (mode === AnnouncementMode.NORMAL && mutedVersion === currentVersion)) return null;
  announcements.sort((a: AnnouncementItem, b: AnnouncementItem): number => timestamp(b) - timestamp(a));
  const messages: string[] = [];
  for (let i: number = 0; i < announcements.length; i++) {
    const item: AnnouncementItem = announcements[i];
    if (announcements.length === 1) {
      messages.push(item.content || item.title);
    } else {
      const date: string = item.created_at ? `\n${item.created_at.substring(0, 10)}` : '';
      messages.push(`${i + 1}. ${item.title}\n${item.content}${date}`);
    }
  }
  return { title: announcements.length === 1 ? announcements[0].title : '公告',
    message: messages.join('\n\n'), version: currentVersion };
}
