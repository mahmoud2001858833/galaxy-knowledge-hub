/**
 * Live Support & User Sessions Hub Service
 * Handles user inquiries from the corner widget and bridges communication to the Admin Control Hub.
 */

export interface SupportChatMessage {
  id: string;
  sender: 'user' | 'admin';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface SupportSession {
  id: string;
  userName: string;
  userEmail: string;
  userRole?: string;
  topic: string;
  status: 'open' | 'responding' | 'resolved';
  createdAt: string;
  lastActive: string;
  messages: SupportChatMessage[];
  unreadForAdmin: boolean;
  unreadForUser: boolean;
  deviceInfo?: string;
}

const STORAGE_KEY = 'galaxy_live_support_sessions_v2';

const SEED_SESSIONS: SupportSession[] = [
  {
    id: 'sess-seed-1',
    userName: 'محمود العمري',
    userEmail: 'mahmoud.omari@gmail.com',
    userRole: 'طالب توجيهي علمي',
    topic: 'استفسار حول محاكاة التأثير الكهروضوئي وقيمة ثابت بلانك',
    status: 'open',
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    unreadForAdmin: true,
    unreadForUser: false,
    deviceInfo: 'Chrome / Windows 11',
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        senderName: 'محمود العمري',
        text: 'السلام عليكم، هل يمكن إضافة خيار رسم بياني مباشر بين تردد الضوء وطاقة حركة الإلكترونات في محاكاة التأثير الكهروضوئي؟',
        timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString()
      }
    ]
  },
  {
    id: 'sess-seed-2',
    userName: 'المعلمة رانية حداد',
    userEmail: 'rania.haddad@edu.jo',
    userRole: 'معلمة أحياء',
    topic: 'تفعيل محاكاة كريسبر داخل الصف الافتراضي',
    status: 'responding',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    unreadForAdmin: false,
    unreadForUser: false,
    deviceInfo: 'Safari / iPad OS',
    messages: [
      {
        id: 'msg-2',
        sender: 'user',
        senderName: 'المعلمة رانية حداد',
        text: 'مرحباً إدارة المنصة، كيف يمكنني تصدير تقرير نشاط الطلاب في محاكاة كريسبر إلى ملف إكسل؟',
        timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString()
      },
      {
        id: 'msg-3',
        sender: 'admin',
        senderName: 'إدارة ذروة العلم',
        text: 'أهلاً بكِ أستاذة رانية. يمكنكِ ذلك مباشرة من خلال زر "تصدير القياسات" أعلى واجهة المحاكاة بصيغة CSV وExcel.',
        timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
      }
    ]
  },
  {
    id: 'sess-seed-3',
    userName: 'يوسف عبد الرحمن',
    userEmail: 'yousef.a@student.jo',
    userRole: 'طالب ثانوي',
    topic: 'طلب إضافة أسئلة تدريبية لمادة الرياضيات BTEC',
    status: 'resolved',
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    lastActive: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    unreadForAdmin: false,
    unreadForUser: false,
    deviceInfo: 'Firefox / Mac OS',
    messages: [
      {
        id: 'msg-4',
        sender: 'user',
        senderName: 'يوسف عبد الرحمن',
        text: 'هل سيتوفر بنك أسئلة لمناهج الحوسبة BTEC قريباً؟',
        timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString()
      },
      {
        id: 'msg-5',
        sender: 'admin',
        senderName: 'إدارة ذروة العلم',
        text: 'تم تفعيل بنك الأسئلة المتقدم 2.0 وتحديثه بالكامل ليدعم BTEC والرياضيات التطبيقية.',
        timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString()
      }
    ]
  }
];

class LiveSupportService {
  private sessions: SupportSession[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.sessions = JSON.parse(stored);
      } else {
        this.sessions = SEED_SESSIONS;
        this.save();
      }
    } catch {
      this.sessions = SEED_SESSIONS;
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.sessions));
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('galaxy_live_support_updated', { detail: this.sessions }));
      }
    } catch (e) {
      console.warn('Failed to save live support sessions', e);
    }
  }

  public getSessions(): SupportSession[] {
    return [...this.sessions];
  }

  public getSessionById(id: string): SupportSession | undefined {
    return this.sessions.find((s) => s.id === id);
  }

  public createSession(data: {
    userName: string;
    userEmail: string;
    topic: string;
    initialMessage: string;
  }): SupportSession {
    const sessionId = 'sess-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const now = new Date().toISOString();

    const newSession: SupportSession = {
      id: sessionId,
      userName: data.userName.trim() || 'زائر للمنصة',
      userEmail: data.userEmail.trim() || 'visitor@galaxy.hub',
      topic: data.topic.trim() || 'استفسار عام',
      status: 'open',
      createdAt: now,
      lastActive: now,
      unreadForAdmin: true,
      unreadForUser: false,
      deviceInfo: typeof navigator !== 'undefined' ? `${navigator.platform}` : 'Unknown',
      messages: [
        {
          id: 'msg-' + Date.now(),
          sender: 'user',
          senderName: data.userName.trim() || 'زائر',
          text: data.initialMessage.trim(),
          timestamp: now
        }
      ]
    };

    this.sessions.unshift(newSession);
    this.save();
    return newSession;
  }

  public sendMessage(sessionId: string, text: string, sender: 'user' | 'admin', senderName: string): SupportSession | null {
    const session = this.sessions.find((s) => s.id === sessionId);
    if (!session) return null;

    const now = new Date().toISOString();
    const newMsg: SupportChatMessage = {
      id: 'msg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 4),
      sender,
      senderName,
      text: text.trim(),
      timestamp: now
    };

    session.messages.push(newMsg);
    session.lastActive = now;
    if (sender === 'user') {
      session.unreadForAdmin = true;
      session.status = 'open';
    } else {
      session.unreadForUser = true;
      session.status = 'responding';
    }

    this.save();
    return session;
  }

  public markAsRead(sessionId: string, forWhom: 'admin' | 'user') {
    const session = this.sessions.find((s) => s.id === sessionId);
    if (!session) return;
    if (forWhom === 'admin') session.unreadForAdmin = false;
    else session.unreadForUser = false;
    this.save();
  }

  public updateStatus(sessionId: string, status: SupportSession['status']) {
    const session = this.sessions.find((s) => s.id === sessionId);
    if (!session) return;
    session.status = status;
    this.save();
  }

  public deleteSession(sessionId: string) {
    this.sessions = this.sessions.filter((s) => s.id !== sessionId);
    this.save();
  }
}

export const liveSupportService = new LiveSupportService();
