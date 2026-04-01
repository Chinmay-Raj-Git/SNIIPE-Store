import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTheme } from '../theme/ThemeContext'
import { fetchProductsWithVariants, normalizeProducts } from '../api/productApi'
import ProductCard from '../components/ProductCard'
import { ProductCardSkeleton } from '../components/skeletons'
import landingImg from '../assets/landing.png'

// ── Why SNIIPE pillars ───────────────────────────────────────
const WHY_ITEMS = [
  { icon: 'fa-crown',      title: 'Premium Quality',     desc: 'High-grade fabrics and attention to detail in every stitch.' },
  { icon: 'fa-bolt',       title: 'Limited Drops',        desc: 'No mass production. Exclusive collections only.' },
  { icon: 'fa-street-view',title: 'Street-First Design',  desc: 'Built for real life — versatile, bold, and comfortable.' },
]

const FAQS = [
  { q: 'How long does delivery take?',     a: 'Orders are shipped within 24-48 hours and typically arrive within 3-7 business days.' },
  { q: 'Do you offer returns or exchanges?', a: 'Yes. Easy returns within 7 days for unused products with original tags.' },
  { q: 'Is Cash on Delivery available?',   a: 'No, currently, only online payments are accepted.' }
]

function HeroSection({ theme }) {
  const imgRef = useRef(null)
  useEffect(() => {
    const h = () => {
      if (imgRef.current) imgRef.current.style.transform = `translateY(${window.scrollY * 0.4}px)`
    }
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])

  return (
    <section className="relative h-screen overflow-hidden bg-black">
      <img ref={imgRef} src={landingImg} alt="SNIIPE" className="absolute inset-0 w-full h-[130%] object-cover object-[center_25%] opacity-70 hero-parallax" style={{ top: '-15%' }} />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black" />
      <div className="relative h-full flex items-center justify-center px-6 text-center">
        <div className="max-w-4xl">
          <div className="animate-fade-in" style={{ animationDelay: '0.2s', opacity: 0 }}>
            <p className="text-xs md:text-sm font-semibold tracking-[0.4em] uppercase mb-6 opacity-80" style={{ color: theme.primary }}>
              Premium Streetwear
            </p>
          </div>
          <h1 className="font-heading text-[clamp(5rem,18vw,12rem)] font-black leading-none tracking-tight mb-6 animate-slide-up" style={{ animationDelay: '0.3s', opacity: 0, color: theme.primary }}>
            SN<span style={{ color: theme.surface }}>II</span>PE
          </h1>
          {/* Subtitle with backdrop overlay for readability */}
          <div className="animate-slide-up" style={{ animationDelay: '0.5s', opacity: 0 }}>
            <p className="hero-subtitle text-lg md:text-2xl mb-10 inline-block px-6 py-2.5 rounded-xl"
              style={{ color: '#fff', background: 'rgba(0,0,0,0.48)', backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.08)', textShadow: '0 1px 8px rgba(0,0,0,0.55)' }}>
              Quality Fabric. Clean Silhouettes. Limited Drops.
            </p>
          </div>
          <div className="animate-slide-up" style={{ animationDelay: '0.7s', opacity: 0 }}>
            <Link to="/collections" className="hero-cta inline-flex items-center gap-3 px-12 py-4 rounded-xl text-lg font-semibold shadow-2xl transition-all duration-300 hover:scale-105 group"
              style={{ background: `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`, color: '#ffffff' }}>
              Explore Store
              <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
      <div className="hero-scroll-hint absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce opacity-50">
        <span className="text-xs tracking-widest uppercase" style={{ color: '#fff' }}>Scroll</span>
        <i className="fa-solid fa-chevron-down text-xs" style={{ color: '#fff' }} />
      </div>
    </section>
  )
}

function PromoBanner({ theme }) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-16">
      <div className="promo-inner relative overflow-hidden rounded-2xl p-10 md:p-14 text-center"
        style={{ background: `linear-gradient(135deg, ${theme.ctaGradientFrom}22, ${theme.ctaGradientTo}44)`, border: `1px solid ${theme.primary}44` }}>
        <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: theme.primary }} />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full opacity-10" style={{ backgroundColor: theme.primary }} />
        <div className="relative z-10">
          <p className="text-xs font-semibold tracking-[0.4em] uppercase mb-4" style={{ color: theme.primary }}>
            NEW ARRIVALS ALERT
            </p>
          <h2 className="font-heading text-4xl md:text-5xl font-black mb-4" style={{ color: theme.textPrimary }}>
            Introducing KURTIS Collection
            </h2>
          <p className="text-base mb-8 max-w-md mx-auto" style={{ color: theme.textSecondary }}>
            Crafted with love, built for women who carry strength with softness.
            </p>
          <Link to="/collections" className="inline-flex items-center gap-3 px-10 py-3.5 rounded-xl text-base font-bold transition-all hover:scale-105"
            style={{ background: `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`, color: '#fff' }}>
            View Collection
            <i className="fa-solid fa-arrow-right" />
          </Link>
        </div>
      </div>
    </section>
  )
}

function FeaturedProducts({ theme }) {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProductsWithVariants()
      .then((raw) => setProducts(normalizeProducts(raw).slice(0, 6)))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <section className="max-w-7xl mx-auto pb-24 px-6">
      <p className="text-xs font-semibold tracking-[0.4em] uppercase text-center mb-3" style={{ color: theme.primary }}>Collection</p>
      <h2 className="font-heading text-5xl font-bold text-center mb-12" style={{ color: theme.textPrimary }}>Featured Drops</h2>
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-7">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <ProductCardSkeleton key={i} />)
          : products.map((p) => <ProductCard key={p.id} product={p} />)
        }
      </div>
      <div className="text-center mt-12">
        <Link to="/collections"
          className="inline-flex items-center gap-2 px-10 py-3 rounded-xl text-sm font-semibold border transition-all hover:scale-105"
          style={{ borderColor: theme.primary, color: theme.primary }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = theme.primary; e.currentTarget.style.color = '#fff' }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = theme.primary }}>
          View All Products <i className="fa-solid fa-arrow-right" />
        </Link>
      </div>
    </section>
  )
}

function AboutSection({ theme }) {
  return (
    <section style={{ backgroundColor: theme.surface }} className="py-24 px-6">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-xs font-semibold tracking-[0.4em] uppercase mb-4" style={{ color: theme.primary }}>Our Story</p>
        <h2 className="font-heading text-5xl md:text-6xl font-bold mb-6" style={{ color: theme.textPrimary }}>About SNIIPE</h2>
        <p className="text-lg leading-relaxed max-w-3xl mx-auto" style={{ color: theme.textSecondary }}>
          SNIIPE is a modern streetwear label focused on clean silhouettes, premium fabrics, and limited drops.
          Designed for everyday wear — inspired by urban culture, individuality, and self-expression.
        </p>
      </div>
    </section>
  )
}

function WhySniipe({ theme }) {
  return (
    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        {WHY_ITEMS.map(({ icon, title, desc }) => (
          <div key={title} style={{ backgroundColor: theme.surface, borderColor: theme.border }} className="product-card border rounded-2xl p-10">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5" style={{ backgroundColor: theme.primaryMuted }}>
              <i className={`fas ${icon} text-2xl`} style={{ color: theme.iconColor }} />
            </div>
            <h3 className="text-xl font-semibold mb-3" style={{ color: theme.textPrimary }}>{title}</h3>
            <p className="text-sm leading-relaxed" style={{ color: theme.textSecondary }}>{desc}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function SupportSection({ theme }) {
  return (
    <section className="max-w-6xl mx-auto py-20 px-6 text-center">
      <h2 className="font-heading text-4xl md:text-5xl font-bold mb-5" style={{ color: theme.textPrimary }}>Need Help?</h2>
      <p className="text-lg max-w-2xl mx-auto mb-10" style={{ color: theme.textSecondary }}>
        Have questions about orders, sizing, or returns? Our support team is always here to help.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Link to="/support" className="px-9 py-3 border rounded-xl text-sm font-semibold transition-all hover:scale-105" style={{ borderColor: theme.primary, color: theme.primary }}>
          Support Center
        </Link>
        <Link to="/contact" className="px-9 py-3 rounded-xl text-sm font-bold transition-all hover:scale-105"
          style={{ background: `linear-gradient(135deg, ${theme.ctaGradientFrom}, ${theme.ctaGradientTo})`, color: '#fff' }}>
          Contact Us
        </Link>
      </div>
    </section>
  )
}

function FAQSection({ theme }) {
  const [openIndex, setOpenIndex] = useState(null)
  return (
    <section className="max-w-4xl mx-auto py-20 px-6 pb-28">
      <p className="text-xs font-semibold tracking-[0.4em] uppercase text-center mb-4" style={{ color: theme.primary }}>Got Questions?</p>
      <h2 className="font-heading text-5xl font-bold text-center mb-12" style={{ color: theme.textPrimary }}>FAQs</h2>
      <div className="space-y-4">
        {FAQS.map(({ q, a }, i) => (
          <div key={i} style={{ backgroundColor: theme.surface, borderColor: openIndex === i ? theme.primary + '66' : theme.border }} className="border rounded-xl overflow-hidden transition-all duration-200">
            <button onClick={() => setOpenIndex(openIndex === i ? null : i)} className="w-full flex items-center justify-between px-7 py-5 text-left">
              <span className="font-semibold text-base" style={{ color: theme.textPrimary }}>{q}</span>
              <i className="fa-solid fa-plus faq-icon flex-shrink-0 ml-4" style={{ color: theme.primary, transform: openIndex === i ? 'rotate(45deg)' : 'rotate(0)', transition: 'transform 0.25s ease' }} />
            </button>
            {openIndex === i && (
              <div className="px-7 pb-5 text-sm leading-relaxed" style={{ color: theme.textSecondary }}>{a}</div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

export default function Landing() {
  const { theme } = useTheme()
  return (
    <div style={{ backgroundColor: theme.background }}>
      <HeroSection theme={theme} />
      <PromoBanner theme={theme} />
      <FeaturedProducts theme={theme} />
      <AboutSection theme={theme} />
      <WhySniipe theme={theme} />
      <SupportSection theme={theme} />
      <FAQSection theme={theme} />
    </div>
  )
}
