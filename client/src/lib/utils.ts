import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount?: number | null, currency = 'INR'): string {
  const num = typeof amount === 'number' && !isNaN(amount) ? amount : (Number(amount) || 0)
  if (currency === 'INR') {
    if (num >= 100000) {
      return `₹${(num / 100000).toFixed(1)}L`
    }
    if (num >= 1000) {
      return `₹${(num / 1000).toFixed(1)}k`
    }
    return `₹${num.toLocaleString('en-IN')}`
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(num)
}

export function formatNumber(n?: number | null): string {
  const num = typeof n === 'number' && !isNaN(n) ? n : (Number(n) || 0)
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`
  return num.toString()
}

export function getInitials(name?: string | null): string {
  if (!name) return '?'
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() || '')
    .join('') || '?'
}

export function timeAgo(date?: string | Date | null): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const now = new Date()
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000)

  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export function scoreToColor(score?: number | null): string {
  const s = typeof score === 'number' && !isNaN(score) ? score : 0
  if (s >= 70) return 'text-red-600'
  if (s >= 45) return 'text-orange-600'
  return 'text-blue-600'
}

export function temperatureLabel(temp?: string | null): { label: string; icon: string; className: string } {
  switch (temp) {
    case 'hot':
      return { label: 'Hot', icon: '🔥', className: 'score-hot' }
    case 'warm':
      return { label: 'Warm', icon: '🟠', className: 'score-warm' }
    default:
      return { label: 'Cold', icon: '❄️', className: 'score-cold' }
  }
}

export function stageLabel(stage?: string | null): string {
  if (!stage) return ''
  const labels: Record<string, string> = {
    new: 'New',
    contacted: 'Contacted',
    qualified: 'Qualified',
    proposal: 'Proposal',
    negotiation: 'Negotiation',
    won: 'Won',
    lost: 'Lost',
  }
  return labels[stage] || stage
}

export function sourceIcon(source?: string | null): string {
  if (!source) return '📌'
  const icons: Record<string, string> = {
    website: '🌐',
    whatsapp: '💬',
    instagram: '📸',
    facebook: '👥',
    linkedin: '💼',
    email: '📧',
    google_forms: '📋',
    calendly: '📅',
    manual: '✏️',
    csv: '📊',
    other: '📌',
  }
  return icons[source] || '📌'
}

export function truncate(str?: string | null, maxLength = 50): string {
  if (!str) return ''
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength) + '...'
}

export function formatDate(date: string | Date | undefined | null): string {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export function getScoreColor(score?: number | null): string {
  const s = typeof score === 'number' && !isNaN(score) ? score : 0
  if (s >= 75) return 'text-red-500 font-bold'
  if (s >= 50) return 'text-amber-500 font-medium'
  return 'text-blue-500 font-normal'
}

