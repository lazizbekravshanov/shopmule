"use client"

import { useCallback } from "react"

interface UseSmoothScrollOptions {
  offset?: number
  behavior?: ScrollBehavior
}

export function useSmoothScroll(options: UseSmoothScrollOptions = {}) {
  const { offset = 80, behavior = "smooth" } = options

  const scrollToElement = useCallback(
    (selector: string) => {
      const element = document.querySelector(selector)
      if (element) {
        const elementPosition = element.getBoundingClientRect().top + window.scrollY
        const offsetPosition = elementPosition - offset

        window.scrollTo({
          top: offsetPosition,
          behavior,
        })
      }
    },
    [offset, behavior]
  )

  const handleAnchorClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault()
      scrollToElement(href)

      // Update URL hash without scrolling
      window.history.pushState(null, "", href)
    },
    [scrollToElement]
  )

  return { scrollToElement, handleAnchorClick }
}
