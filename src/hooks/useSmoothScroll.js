import { useEffect, useRef } from 'react'
import Lenis from 'lenis'

export default function useSmoothScroll() {
  const lenisRef = useRef(null)

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.15,
      smoothWheel: true,
      wheelMultiplier: 0.9,
    })

    lenisRef.current = lenis

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  return lenisRef
}
