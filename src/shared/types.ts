export interface Skill {
  name: string;
  description: string;
  version: string;
  tags: string[];
  updatedAt: string;
}

export interface SkillIndex {
  skills: Skill[];
  fetchedAt: number;
  etag?: string;
}

export const STORAGE_KEYS = {
  SKILL_INDEX: 'skillIndex',
  CDN_ORIGIN: 'cdnOrigin',
  CACHE_TTL: 'cacheTtl',
} as const;

export const DEFAULT_CDN_ORIGIN = 'https://<github-user>.github.io/<repo>';
export const DEFAULT_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const TARGET_DOMAINS = [
  'gemini.google.com',
  'chat.openai.com',
  'chatgpt.com',
  'chat.qwen.ai',
  'qwen.ai',
];

export const HARD_CODED_SKILLS: Skill[] = [
  {
    name: 'opsx:propose',
    description: 'Create a new OpenSpec proposal with all artifacts',
    version: '1.0.0',
    tags: ['planning', 'specification'],
    updatedAt: new Date().toISOString(),
  },
  {
    name: 'opsx:plan',
    description: 'Write a markdown plan to .hermes/plans/',
    version: '1.0.0',
    tags: ['planning'],
    updatedAt: new Date().toISOString(),
  },
  {
    name: 'opsx:review',
    description: 'Pre-commit review: security scan, quality gates, auto-fix',
    version: '1.0.0',
    tags: ['review', 'quality'],
    updatedAt: new Date().toISOString(),
  },
];

export function deriveSkillPath(name: string): string {
  const [namespace, command] = name.split(':');
  if (!namespace || !command) {
    throw new Error(`Invalid skill name format: ${name}. Expected 'namespace:command'`);
  }
  return `skills/${namespace}/${command}/SKILL.md`;
}

export function validateSkillIndex(data: unknown): data is SkillIndex {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  if (!Array.isArray(obj.skills)) return false;
  if (typeof obj.fetchedAt !== 'number') return false;
  
  for (const skill of obj.skills) {
    if (!validateSkill(skill)) return false;
  }
  return true;
}

export function validateSkill(data: unknown): data is Skill {
  if (!data || typeof data !== 'object') return false;
  const obj = data as Record<string, unknown>;
  return (
    typeof obj.name === 'string' &&
    typeof obj.description === 'string' &&
    typeof obj.version === 'string' &&
    Array.isArray(obj.tags) &&
    obj.tags.every(t => typeof t === 'string') &&
    typeof obj.updatedAt === 'string'
  );
}

export function filterSkills(skills: Skill[], query: string): Skill[] {
  if (!query.trim()) return skills;
  
  const prefixMatch = query.match(/^\/([^:]+):?(.*)$/);
  if (prefixMatch) {
    const [, namespace, commandPrefix] = prefixMatch;
    return skills.filter(s => {
      const [skillNs, skillCmd] = s.name.split(':');
      if (skillNs !== namespace) return false;
      if (!commandPrefix) return true;
      return skillCmd.startsWith(commandPrefix);
    });
  }
  
  // Fallback: simple substring match on name or description
  const lowerQuery = query.toLowerCase();
  return skills.filter(s => 
    s.name.toLowerCase().includes(lowerQuery) ||
    s.description.toLowerCase().includes(lowerQuery)
  );
}

export function truncateSkillName(name: string, maxLength = 40): string {
  if (name.length <= maxLength) return name;
  return name.slice(0, maxLength - 3) + '...';
}