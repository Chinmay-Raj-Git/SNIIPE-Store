import { useState } from 'react'
import { useTheme } from '../theme/ThemeContext'

const PLACEHOLDER = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="700" viewBox="0 0 600 700"><rect width="600" height="700" fill="%23111"/><text x="50%25" y="50%25" font-family="sans-serif" font-size="72" fill="%23333" text-anchor="middle" dy=".3em">✦</text></svg>'

/**
 * ProductGallery
 *
 * Main product image display with thumbnail strip.
 * Supports click-to-select thumbnail, zoom hint on hover.
 *
 * @param {Array}  images           - [{ url, color }]
 * @param {number} activeIndex      - controlled active image index
 * @param {fn}     onIndexChange    - called with new index
 * @param {string} productName      - for alt text
 */
export default function ProductGallery({ images, activeIndex = 0, onIndexChange, productName = '' }) {
  const { theme } = useTheme()
  const [zoomed, setZoomed] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 })

  const displayImages = images && images.length > 0 ? images : [{ url: null }]
  const activeImg   = displayImages[activeIndex] ?? {}
  const activeImage = activeImg.url ?? null
  // role === 'primary' -> landscape 4/3; everything else -> portrait 3/4
  // const aspectRatio = '4 / 3'
  // const aspectRatio = activeImg.role === 'primary' ? '4 / 3' : ()
  
  const aspectRatio = activeImg.aspect_ratio ? activeImg.aspect_ratio : (activeImg.role != 'primary' ? '3 / 4' : '4 / 3')

  // let aspectRatio;
  // if(activeImg.role === 'primary') {
  //   aspectRatio = '4 / 3';
  // } else if (activeImg.role === 'thumbnail') {
  //   aspectRatio = '1 / 1';
  // } else {
  //   aspectRatio = '4 / 3'; // default to square if role is unknown
  // }

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePos({ x, y })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

      {/* Main image */}
      <div
        style={{
          position: 'relative',
          borderRadius: '16px',
          overflow: 'hidden',
          backgroundColor: theme.surfaceHover,
          border: `1px solid ${theme.border}`,
          cursor: zoomed ? 'zoom-out' : 'zoom-in',
          aspectRatio,
        }}
        onClick={() => setZoomed(!zoomed)}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setZoomed(false)}
      >
        <img
          src={activeImage ?? PLACEHOLDER}
          alt={`${productName} — view ${activeIndex + 1}`}
          onError={(e) => { e.target.src = PLACEHOLDER }}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            transition: zoomed ? 'none' : 'transform 0.4s ease',
            transform: zoomed
              ? `scale(2) translate(${(50 - mousePos.x) * 0.5}%, ${(50 - mousePos.y) * 0.5}%)`
              : 'scale(1)',
            transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
            display: 'block',
          }}
        />

        {/* Image counter */}
        {displayImages.length > 1 && (
          <span
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              fontSize: '11px',
              fontWeight: 600,
              color: '#fff',
              backgroundColor: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)',
              padding: '3px 10px',
              borderRadius: '999px',
              letterSpacing: '0.05em',
            }}
          >
            {activeIndex + 1} / {displayImages.length}
          </span>
        )}

        {/* Zoom hint */}
        {!zoomed && activeImage && (
          <div
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '12px',
            }}
          >
            <i className="fa-solid fa-magnifying-glass-plus" />
          </div>
        )}

        {/* Arrow nav for mobile */}
        {displayImages.length > 1 && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onIndexChange?.((activeIndex - 1 + displayImages.length) % displayImages.length) }}
              style={{
                position: 'absolute', left: '10px', top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)', border: 'none',
                color: '#fff', borderRadius: '50%', width: '36px', height: '36px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(4px)',
              }}
            >
              <i className="fa-solid fa-chevron-left" style={{ fontSize: '12px' }} />
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); e.preventDefault(); onIndexChange?.((activeIndex + 1) % displayImages.length) }}
              style={{
                position: 'absolute', right: '10px', top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.5)', border: 'none',
                color: '#fff', borderRadius: '50%', width: '36px', height: '36px',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                backdropFilter: 'blur(4px)',
              }}
            >
              <i className="fa-solid fa-chevron-right" style={{ fontSize: '12px' }} />
            </button>
          </>
        )}
      </div>

      {/* Thumbnail strip */}
      {displayImages.length > 1 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {displayImages.map((img, i) => (
            <button
              key={i}
              onClick={() => onIndexChange?.(i)}
              style={{
                flexShrink: 0,
                width: '70px',
                height: '85px',
                borderRadius: '8px',
                overflow: 'hidden',
                border: `2px solid ${i === activeIndex ? theme.primary : theme.border}`,
                padding: 0,
                cursor: 'pointer',
                transition: 'border-color 0.2s ease, opacity 0.2s ease',
                opacity: i === activeIndex ? 1 : 0.6,
                backgroundColor: theme.surfaceHover,
              }}
              onMouseEnter={(e) => { if (i !== activeIndex) e.currentTarget.style.opacity = '0.85' }}
              onMouseLeave={(e) => { if (i !== activeIndex) e.currentTarget.style.opacity = '0.6' }}
            >
              <img
                src={img.url ?? PLACEHOLDER}
                alt={`${productName} thumbnail ${i + 1}`}
                onError={(e) => { e.target.src = PLACEHOLDER }}
                style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
