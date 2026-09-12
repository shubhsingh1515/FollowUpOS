import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register plugins once
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export { gsap, ScrollTrigger }

/**
 * Checks if user prefers reduced motion
 */
export const prefersReducedMotion = (): boolean => {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/**
 * Animate numbers rolling up from start to end value
 */
export const animateCounter = (
  element: HTMLElement | null,
  endValue: number,
  duration = 1.5,
  prefix = '',
  suffix = '',
  decimals = 0
) => {
  if (!element || prefersReducedMotion()) {
    if (element) element.innerText = `${prefix}${endValue.toLocaleString()}${suffix}`
    return
  }

  const obj = { value: 0 }
  gsap.to(obj, {
    value: endValue,
    duration,
    ease: 'power2.out',
    onUpdate: () => {
      element.innerText = `${prefix}${obj.value.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}${suffix}`
    },
  })
}

/**
 * Fade up animation utility for scroll trigger
 */
export const createFadeUpTrigger = (
  target: string | HTMLElement,
  triggerEl?: string | HTMLElement,
  delay = 0
) => {
  if (prefersReducedMotion()) return null

  return gsap.fromTo(
    target,
    { opacity: 0, y: 30 },
    {
      opacity: 1,
      y: 0,
      duration: 0.8,
      delay,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: triggerEl || target,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    }
  )
}
