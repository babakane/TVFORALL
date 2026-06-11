// Program Guide - EPG and schedule management
export interface Program {
  id: string;
  title: string;
  description: string;
  startTime: number;
  endTime: number;
  channelId: string;
  category: string;
  rating?: string;
  duration: number;
  isLive: boolean;
  isFeatured?: boolean;
}

export interface ChannelPrograms {
  channelId: string;
  channelName: string;
  programs: Program[];
}

export class ProgramGuide {
  private static instance: ProgramGuide;
  private programs: Map<string, Program[]> = new Map();
  private listeners: Set<(guide: ChannelPrograms[]) => void> = new Set();

  private constructor() {
    this.initializeDefaultPrograms();
  }

  static getInstance(): ProgramGuide {
    if (!ProgramGuide.instance) {
      ProgramGuide.instance = new ProgramGuide();
    }
    return ProgramGuide.instance;
  }

  private initializeDefaultPrograms(): void {
    const now = Date.now();
    const programs: Program[] = [
      {
        id: 'prog001',
        title: 'World Cup Final',
        description: 'The championship match of the FIFA World Cup',
        startTime: now + 3600000,
        endTime: now + 7200000,
        channelId: 'ch_espn',
        category: 'Sports',
        rating: 'PG',
        duration: 120,
        isLive: false,
        isFeatured: true,
      },
      {
        id: 'prog002',
        title: 'World Cup Highlights',
        description: 'Best moments from today\'s matches',
        startTime: now + 10800000,
        endTime: now + 12600000,
        channelId: 'ch_foxsports',
        category: 'Sports',
        duration: 30,
        isLive: false,
      },
    ];

    this.programs.set('ch_espn', programs);
  }

  getChannelPrograms(channelId: string, hoursAhead: number = 24): ChannelPrograms {
    const programs = this.programs.get(channelId) || [];
    const now = Date.now();
    const filtered = programs.filter((p) => p.startTime >= now && p.startTime <= now + hoursAhead * 3600000);

    return {
      channelId,
      channelName: this.getChannelName(channelId),
      programs: filtered.sort((a, b) => a.startTime - b.startTime),
    };
  }

  getLivePrograms(): Program[] {
    const allPrograms: Program[] = [];
    this.programs.forEach((programs) => {
      allPrograms.push(...programs);
    });

    const now = Date.now();
    return allPrograms
      .filter((p) => p.startTime <= now && p.endTime >= now)
      .map((p) => ({ ...p, isLive: true }));
  }

  getFeaturedPrograms(): Program[] {
    const allPrograms: Program[] = [];
    this.programs.forEach((programs) => {
      allPrograms.push(...programs);
    });

    return allPrograms.filter((p) => p.isFeatured).sort((a, b) => a.startTime - b.startTime);
  }

  searchPrograms(query: string): Program[] {
    const allPrograms: Program[] = [];
    this.programs.forEach((programs) => {
      allPrograms.push(...programs);
    });

    return allPrograms.filter(
      (p) =>
        p.title.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase())
    );
  }

  addReminder(programId: string): void {
    if (typeof window !== 'undefined') {
      const reminders = JSON.parse(localStorage.getItem('program_reminders') || '[]');
      if (!reminders.includes(programId)) {
        reminders.push(programId);
        localStorage.setItem('program_reminders', JSON.stringify(reminders));
      }
    }
  }

  private getChannelName(channelId: string): string {
    const names: Record<string, string> = {
      ch_espn: 'ESPN',
      ch_foxsports: 'Fox Sports',
      ch_beinsports: 'beIN Sports',
      ch_skysports: 'Sky Sports',
    };
    return names[channelId] || 'Unknown Channel';
  }

  subscribe(listener: (guide: ChannelPrograms[]) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }
}
