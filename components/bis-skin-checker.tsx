"use client"

import { useEffect } from "react"

export function BisSkinChecker() {
  useEffect(() => {
    const n = "bis_skin_checked"
    function c() {
      try {
        const a = document.querySelectorAll("[" + n + "]")
        for (let i = 0; i < a.length; i++) {
          a[i].removeAttribute(n)
        }
      } catch (e) {}
    }
    c()
    const o = new MutationObserver(c)
    o.observe(document.documentElement, {
      attributes: true,
      attributeFilter: [n],
      childList: true,
      subtree: true,
    })
    const t = setInterval(c, 100)
    
    // Auto-cleanup after 6 seconds to match original script
    const timeout = setTimeout(() => {
      clearInterval(t)
      o.disconnect()
    }, 6000)

    return () => {
      clearInterval(t)
      clearTimeout(timeout)
      o.disconnect()
    }
  }, [])

  return null
}
