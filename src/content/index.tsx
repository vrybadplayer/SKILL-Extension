import { h, render } from 'preact';
import { useState, useEffect, useRef, useCallback } from 'preact/hooks';
import type { Skill, SkillIndex } from '../shared/types';
import { HARD_CODED_SKILLS, STORAGE_KEYS, deriveSkillPath, validateSkillIndex, filterSkills, truncateSkillName } from '../shared/types';

// Firefox WebExtension types
declare const browser: {
  runtime: {
    onMessage: { addListener(listener: (message: unknown, sender: unknown, sendResponse: (response: unknown) => void) => boolean | void): void };
    sendMessage(message: unknown): Promise<unknown>;
  };
};

interface PaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onCopy: (skill: Skill) => void;
}

function SkillItem({ skill, isSelected, onSelect }: { skill: Skill; isSelected: boolean; onSelect: () => void }) {
  return (
    <div
      className={`skill-item ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
      role="option"
      aria-selected={isSelected}
    >
      <span className="skill-name">{truncateSkillName(skill.name)}</span>
      <span className="skill-description">{skill.description}</span>
    </div>
  );
}

function Toast({ message, type, onRetry, onDismiss }: { 
  message: string; 
  type: 'error' | 'info' | 'warn';
  onRetry?: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className={`toast toast-${type}`} role="alert">
      <span>{message}</span>
      {onRetry && <button onClick={onRetry}>Retry</button>}
      <button onClick={onDismiss} aria-label="Dismiss">×</button>
    </div>
  );
}

function FallbackModal({ text, onCancel }: { text: string; onCancel: () => void }) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    textareaRef.current?.focus();
    textareaRef.current?.select();
  }, []);
  
  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      // Do NOT close on Escape - per spec
    }
  };
  
  return (
    <div className="fallback-modal-overlay" onKeyDown={handleKeyDown}>
      <div className="fallback-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <h2 id="modal-title">Copy Skill Manually</h2>
        <p>Automatic copy failed. Please press <kbd>Ctrl+C</kbd> to copy the skill text below:</p>
        <textarea 
          ref={textareaRef}
          readOnly
          value={text}
          spellCheck={false}
        />
        <button className="cancel-btn" onClick={onCancel}>Cancel</button>
      </div>
    </div>
  );
}

export function Palette({ isOpen, onClose, onCopy }: PaletteProps) {
  const [skills, setSkills] = useState<Skill[]>(HARD_CODED_SKILLS);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [toast, setToast] = useState<{ message: string; type: 'error' | 'info' | 'warn'; onRetry?: () => void } | null>(null);
  const [showFallback, setShowFallback] = useState<{ text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const filteredSkills = filterSkills(skills, query);
  
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);
  
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return;
    
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filteredSkills.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredSkills[selectedIndex]) {
          onCopy(filteredSkills[selectedIndex]);
        }
        break;
    }
  }, [isOpen, filteredSkills, selectedIndex, onClose, onCopy]);
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
  
  const copyToClipboard = async (text: string): Promise<boolean> => {
    // Tier 1: navigator.clipboard.writeText()
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (e) {
      console.debug('Tier 1 clipboard failed:', e);
    }
    
    // Tier 2: textarea + execCommand('copy')
    try {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      textarea.style.left = '-9999px';
      document.body.appendChild(textarea);
      textarea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textarea);
      if (success) return true;
    } catch (e) {
      console.debug('Tier 2 clipboard failed:', e);
    }
    
    // Tier 3: fallback modal
    return false;
  };
  
  const handleCopy = async (skill: Skill) => {
    const skillText = `# ${skill.name}\n\n${skill.description}\n\n---\n*Version: ${skill.version}*\n*Tags: ${skill.tags.join(', ')}*\n*Updated: ${skill.updatedAt}*`;
    
    const success = await copyToClipboard(skillText);
    if (success) {
      setToast({ message: 'Copied!', type: 'info', onDismiss: () => setToast(null) });
      onClose();
    } else {
      setShowFallback({ text: skillText });
    }
  };
  
  const handleFallbackCancel = () => {
    setShowFallback(null);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="palette-overlay" ref={containerRef} role="dialog" aria-modal="true" aria-label="Agentic Skills Palette">
      <div className="palette-container">
        <div className="palette-header">
          <h1>Agentic Skills</h1>
          <kbd className="shortcut-hint">Alt+Shift+S</kbd>
        </div>
        <input
          ref={inputRef}
          type="text"
          className="palette-input"
          placeholder="Type /namespace:command to filter..."
          value={query}
          onInput={(e) => setQuery(e.target.value)}
          aria-label="Filter skills"
          aria-autocomplete="list"
          aria-controls="skills-list"
        />
        <div className="palette-content">
          {isLoading && <div className="loading">Loading skills...</div>}
          {!isLoading && filteredSkills.length === 0 && skills.length === 0 && (
            <div className="placeholder">No skills available yet.</div>
          )}
          {!isLoading && filteredSkills.length === 0 && skills.length > 0 && query && (
            <div className="placeholder">No skills match '{query}'.</div>
          )}
          {!isLoading && filteredSkills.length > 0 && (
            <ul id="skills-list" className="skills-list" role="listbox">
              {filteredSkills.map((skill, index) => (
                <li key={skill.name}>
                  <SkillItem
                    skill={skill}
                    isSelected={index === selectedIndex}
                    onSelect={() => handleCopy(skill)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onRetry={toast.onRetry}
            onDismiss={() => setToast(null)}
          />
        )}
        {showFallback && (
          <FallbackModal text={showFallback.text} onCancel={handleFallbackCancel} />
        )}
      </div>
    </div>
  );
}

export function mountPalette(rootElement: HTMLElement) {
  let isOpen = false;
  
  const toggle = () => {
    isOpen = !isOpen;
    render();
  };
  
  const close = () => {
    isOpen = false;
    render();
  };
  
  const render = () => {
    render(
      h(Palette, {
        isOpen,
        onClose: close,
        onCopy: handleCopy,
      }),
      rootElement
    );
  };
  
  const handleCopy = async (skill: Skill) => {
    // This will be replaced by the actual implementation
    console.log('Copy skill:', skill.name);
  };
  
  return { toggle, close };
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}

function init() {
  // Check if we're on a target domain
  const hostname = window.location.hostname;
  const isTargetDomain = [
    'gemini.google.com',
    'chat.openai.com',
    'chatgpt.com',
    'chat.qwen.ai',
    'qwen.ai',
  ].some(domain => hostname === domain || hostname.endsWith('.' + domain));
  
  if (!isTargetDomain) {
    console.log('[Agentic Skills] Not a target domain, skipping palette injection');
    return;
  }
  
  // Create Shadow DOM root
  const shadowHost = document.createElement('div');
  shadowHost.id = 'agentic-skills-shadow-host';
  document.body.appendChild(shadowHost);
  
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });
  
  // Inject styles
  const style = document.createElement('style');
  style.textContent = `
    * { box-sizing: border-box; }
    .palette-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
    }
    .palette-container {
      width: 100%;
      max-width: 600px;
      max-height: 70vh;
      background: var(--palette-bg, #fff);
      color: var(--palette-fg, #1a1a1a);
      border: 1px solid var(--palette-border, #ddd);
      border-radius: 8px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.15);
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    @media (prefers-color-scheme: dark) {
      :host {
        --palette-bg: #1e1e1e;
        --palette-fg: #e0e0e0;
        --palette-border: #444;
        --palette-input-bg: #2d2d2d;
        --palette-item-hover: #333;
        --palette-selected: #0066cc;
        --toast-error-bg: #8b1a1a;
        --toast-info-bg: #1a5c8b;
        --toast-warn-bg: #8b6b1a;
        --modal-bg: #252525;
        --modal-border: #555;
      }
    }
    @media (prefers-color-scheme: light) {
      :host {
        --palette-bg: #ffffff;
        --palette-fg: #1a1a1a;
        --palette-border: #dddddd;
        --palette-input-bg: #f5f5f5;
        --palette-item-hover: #f0f0f0;
        --palette-selected: #0066cc;
        --toast-error-bg: #ffeaea;
        --toast-info-bg: #eaf4ff;
        --toast-warn-bg: #fff8e1;
        --modal-bg: #ffffff;
        --modal-border: #dddddd;
      }
    }
    .palette-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 16px;
      border-bottom: 1px solid var(--palette-border);
    }
    .palette-header h1 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
    }
    .shortcut-hint {
      font-size: 11px;
      padding: 2px 6px;
      background: var(--palette-input-bg);
      border-radius: 3px;
      font-family: monospace;
      color: var(--palette-fg);
      opacity: 0.7;
    }
    .palette-input {
      width: 100%;
      padding: 12px 16px;
      border: none;
      border-bottom: 1px solid var(--palette-border);
      background: var(--palette-input-bg);
      color: var(--palette-fg);
      font-size: 14px;
      outline: none;
    }
    .palette-input::placeholder {
      color: var(--palette-fg);
      opacity: 0.5;
    }
    .palette-content {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }
    .skills-list {
      list-style: none;
      margin: 0;
      padding: 0;
    }
    .skill-item {
      padding: 10px 12px;
      border-radius: 6px;
      cursor: pointer;
      transition: background 0.1s;
    }
    .skill-item:hover, .skill-item.selected {
      background: var(--palette-item-hover);
    }
    .skill-item.selected {
      background: var(--palette-selected);
      color: white;
    }
    .skill-name {
      display: block;
      font-weight: 600;
      font-family: monospace;
      font-size: 13px;
      margin-bottom: 2px;
    }
    .skill-description {
      display: block;
      font-size: 12px;
      opacity: 0.8;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .placeholder {
      padding: 24px;
      text-align: center;
      color: var(--palette-fg);
      opacity: 0.6;
    }
    .loading {
      padding: 24px;
      text-align: center;
      color: var(--palette-fg);
    }
    .toast {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 16px;
      margin: 8px;
      border-radius: 6px;
      font-size: 13px;
    }
    .toast-error { background: var(--toast-error-bg); color: #fff; }
    .toast-info { background: var(--toast-info-bg); color: #fff; }
    .toast-warn { background: var(--toast-warn-bg); color: #fff; }
    .toast button {
      margin-left: auto;
      padding: 4px 10px;
      border: 1px solid currentColor;
      background: transparent;
      color: inherit;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    .fallback-modal-overlay {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2147483648;
    }
    .fallback-modal {
      background: var(--modal-bg);
      border: 1px solid var(--modal-border);
      border-radius: 8px;
      padding: 24px;
      max-width: 500px;
      width: 90%;
      max-height: 80vh;
      overflow: auto;
    }
    .fallback-modal h2 { margin: 0 0 12px; }
    .fallback-modal p { margin: 0 0 12px; }
    .fallback-modal kbd {
      background: var(--palette-input-bg);
      padding: 2px 6px;
      border-radius: 3px;
      font-family: monospace;
    }
    .fallback-modal textarea {
      width: 100%;
      min-height: 200px;
      padding: 12px;
      border: 1px solid var(--palette-border);
      border-radius: 4px;
      background: var(--palette-input-bg);
      color: var(--palette-fg);
      font-family: monospace;
      font-size: 13px;
      margin-bottom: 16px;
      resize: vertical;
    }
    .cancel-btn {
      padding: 8px 16px;
      background: var(--palette-selected);
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    }
  `;
  shadowRoot.appendChild(style);
  
  // Create container for Preact
  const container = document.createElement('div');
  shadowRoot.appendChild(container);
  
  // Mount palette
  const { toggle } = mountPalette(container);
  
  // Listen for commands from background
  browser.runtime.onMessage.addListener((message) => {
    if (message.type === 'TOGGLE_PALETTE') {
      toggle();
    }
  });
  
  // Also listen for the keyboard shortcut directly (in case command doesn't fire)
  document.addEventListener('keydown', (e) => {
    if (e.altKey && e.shiftKey && e.key === 'S') {
      e.preventDefault();
      toggle();
    }
  });
  
  console.log('[Agentic Skills] Palette ready');
}