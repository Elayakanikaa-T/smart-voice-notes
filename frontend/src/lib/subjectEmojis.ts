/**
 * Centralized Subject Emoji Utility
 * Ensures consistent subject emoji representation across Dashboard, Subjects, Learning Path, and Notes.
 */

export const getSubjectEmoji = (name: string = '', icon?: string): string => {
  const genericStrings = ['📁', '🗂️', '📂', '🗃️', '📦', '🏷️', '📄', 'folder', 'Folder', 'BookOpen', 'book', 'default'];
  
  // If icon is already a specific emoji (and not a generic string/folder), use it
  if (icon && !genericStrings.includes(icon) && icon.length <= 4 && /[\p{Emoji}]/u.test(icon)) {
    return icon;
  }

  const lower = (name || '').toLowerCase().trim();
  
  if (lower.includes('data structure') || lower.includes('algorithm') || lower.includes('dsa') || lower.includes('tree') || lower.includes('graph')) {
    return '💻';
  }
  if (lower.includes('operating') || lower.includes('system') || lower.includes('os') || lower.includes('process') || lower.includes('memory')) {
    return '⚙️';
  }
  if (lower.includes('analytic') || lower.includes('data') || lower.includes('stat') || lower.includes('regression')) {
    return '📊';
  }
  if (lower.includes('database') || lower.includes('sql') || lower.includes('dbms') || lower.includes('relational')) {
    return '🗄️';
  }
  if (lower.includes('network') || lower.includes('web') || lower.includes('cloud') || lower.includes('tcp') || lower.includes('internet')) {
    return '🌐';
  }
  if (lower.includes('machine') || lower.includes('ai') || lower.includes('intelligence') || lower.includes('learning')) {
    return '🤖';
  }
  if (lower.includes('math') || lower.includes('statistic') || lower.includes('calculus') || lower.includes('algebra') || lower.includes('discrete')) {
    return '📐';
  }
  if (lower.includes('software') || lower.includes('engineer') || lower.includes('design') || lower.includes('architecture')) {
    return '🏗️';
  }
  if (lower.includes('cyber') || lower.includes('security') || lower.includes('crypto') || lower.includes('privacy')) {
    return '🔒';
  }
  if (lower.includes('physics') || lower.includes('science') || lower.includes('circuit') || lower.includes('electronic')) {
    return '⚡';
  }

  return '📚';
};
