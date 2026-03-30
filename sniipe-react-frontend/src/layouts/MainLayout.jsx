import { Outlet } from 'react-router-dom'
import { useTheme } from '../theme/ThemeContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AnnouncementBar from '../components/AnnouncementBar'
import GlobalLoader from '../components/GlobalLoader'
import ServerDownBanner from '../components/ServerDownBanner'

/**
 * MainLayout
 * Wraps all public pages with Navbar + AnnouncementBar + Footer.
 * GlobalLoader renders on top when global loading is active.
 * <Outlet /> renders the matched child route.
 */
export default function MainLayout() {
  const { theme } = useTheme()

  return (
    <div
      style={{
        backgroundColor: theme.background,
        color: theme.textPrimary,
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Sticky header: Navbar + Announcement bar */}
      <div className="sticky top-0 z-50">
        <Navbar />
        <AnnouncementBar />
      </div>

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

      {/* Global loading overlay — mounted once here */}
      <GlobalLoader />

      {/* Server down notification — non-blocking, slides up from bottom */}
      <ServerDownBanner />
    </div>
  )
}
