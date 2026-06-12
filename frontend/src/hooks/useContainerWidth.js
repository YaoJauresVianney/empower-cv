import { useRef, useState, useEffect } from 'react'

export default function useContainerWidth(initialWidth = 400) {
  const ref = useRef(null)
  const [width, setWidth] = useState(initialWidth)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.offsetWidth)
    const ro = new ResizeObserver(([entry]) => {
      setWidth(Math.floor(entry.contentRect.width))
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return [ref, width]
}
