import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import ChatWidget from '../components/ChatWidget'
import Sidebar from '../components/Sidebar'
import TopBar from '../components/TopBar'
import StatCard from '../components/StatCard'
import FilterSelect from '../components/FilterSelect'
import CandidateTable from '../components/CandidateTable'
import ImagePromoCard from '../components/ImagePromoCard'
import HiringTrendsCard from '../components/HiringTrendsCard'
import '../dashboard.css'

const CANDIDATES = [
  {
    id: 1,
    name: 'Elena Rodriguez',
    email: 'elena.r@example.com',
    role: 'Senior Product Designer',
    status: 'Shortlisted',
    score: 94,
    date: 'Oct 24, 2023',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC6PPQNxQAkFObZtUT-NBnPlLOQyWkeNOiE_oS0qONUjmmV7DLvAFN8cpAOOJfHJYwRLmEysy-LIQYVLp9ZkDCzHMweS611kJfXP9PZ84Kb1qgoJ7IrQZrgmhHeeJCD5BqDUDsJX7otFyc6dZG5zsuvS0xZUoGDJoYBja6ple74kHfOXPUBKjRiQWH4f3ralDrS-zZmNbUs8p1pkw8eMRD_GbWFN8xKIWSOXjznKuyeCDdWf3ky5hiRmJ4IBbX2OCkHl1nPA2yr4L0p',
  },
  {
    id: 2,
    name: 'Marcus Chen',
    email: 'm.chen@techsphere.io',
    role: 'Frontend Architect',
    status: 'Interviewing',
    score: 88,
    date: 'Oct 22, 2023',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCmuzhKcFvjPtnT61lqcjT0I_wa5k0NbNzgSr00X2hGKDB8CN47GavC3SeHrIPm5uVM1FjeVZV2UWG2F53FZbkA1igVptk8AeFGkg9b5xCHadsaQjaZihvrE4qsVGUEnd_M0OJeCGdj4vYKHKKVLIHIZnGRYM5bGM-DWJx1NJ1u5YPLiE2zULCWoZh31Do04uU6ra6X6TuzeQ-IkpHfdfGj3wLKcAziJQBPbz3S489t4v9APoeaFFRZsCE2ISDhXzh-bfPkPVcA49Df',
  },
  {
    id: 3,
    name: 'Sarah Jenkins',
    email: 'sarah.j@creative.co',
    role: 'UX Researcher',
    status: 'New',
    score: 72,
    date: 'Oct 25, 2023',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDtGl6OzuL_QJAeKgSuvZiRC6e90iSeL0WKA1zI11KEqjhc6n6cfsa9rDrTmprUkzwGXJub6kIV2AKmUuEZqhkt9SyrbOgA5vWUx15C9Qbc1fs32Lj47oAQ2RfsqyoC0Lh9rRKUONY8B_QRRQQDZJqFQ_jCbCcyJ9bIzulpQ6r_b8ALRddxkRw_UiWhZz5_4NE2InRBviScmKpAKggNvAEeaRek_flQAGEBfjYtBt9j3Kn21EpeVQNtKYACGBqsoGbhwOuTJJtHtLwt',
  },
  {
    id: 4,
    name: 'David Miller',
    email: 'd.miller@outlook.com',
    role: 'Backend Developer',
    status: 'Rejected',
    score: 45,
    date: 'Oct 19, 2023',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdrZZ7zFgRGbE8jUJwkRgoNmsWl9akYGi_V1jsbAMCxG1UrHSjisDHzkzRsfL10iAr_zheDnFVA-fzOpUojmNzm5LXQO3Gl7Nrbl7StLoNTV8KpRzOUpA5gX_F4gOfmPAskBQtFYlofMoaD_7yBq67N6_sPSFmTi98_EuGiWaD5b7tjBiVWnfdYNL0-XieJ-mYNxNHeu20My20W8c6QmiopK8sPgcIBZBaiVZoJ70YaQZ7d75AiesoCVXFPA-itkwMtN7dMzsDOIPj',
  },
  {
    id: 5,
    name: 'Lila Thorne',
    email: 'lila.t@agency.net',
    role: 'Marketing Specialist',
    status: 'Shortlisted',
    score: 91,
    date: 'Oct 26, 2023',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC1eB--kJm5Z5Yz5A0AjfPCfeUAfVeJIV54uaepbC80s7pn615XpfLWJjnBlS5JhrSL1TCGJRMBAigcySLoK856Thwya1I2i7Umro8CqGwu3ZfbkCPBtBG47LLsnsWR7prv6TOMJbYcNgtzsMB3I9MTNWoW5qpsCnrLertp0nmgifceGGGC8Wx1K0hhkP3E-dd9zJVphHzwjlo0-OKmAgMTlzKzXL0sQWP2U5ZHSsVvCEectsd6zB_95aJf2g22Ggp_dJ63e92vNGxm',
  },
]


const STATS = [
  {
    label: 'Total candidates',
    value: '1,284',
    trend: '+12% from last month',
    trendIcon: 'trending_up',
    positive: true,
  },
  {
    label: 'Active jobs',
    value: '42',
    trend: '5 posted this week',
    trendIcon: 'add_circle',
    positive: true,
  },
  {
    label: 'Interviews today',
    value: '8',
    trend: 'Next at 2:00 PM',
    trendIcon: 'schedule',
    positive: null,
  },
  {
    label: 'Avg. match score',
    value: '78%',
    bar: 78,
  },
]

export default function DashboardPage() {
  const navigate = useNavigate()
  const { getUser, logout } = useAuth()
  const user = getUser()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      <link
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        rel="stylesheet"
      />

      <div className="overflow-x-hidden min-h-[100dvh]" style={{ fontFamily: "'Manrope', sans-serif" }}>

        {/* ── Sidebar ─────────────────────────────────────────── */}
        <Sidebar
          onLogout={handleLogout}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* ── Main ────────────────────────────────────────────── */}
        <main className="lg:ml-64 min-h-[100dvh]">

          {/* Top bar */}
          <TopBar user={user} onMenuToggle={() => setSidebarOpen(true)} />

          {/* Page content */}
          <div className="p-6 max-w-[1400px] mx-auto">

            {/* ── Stat cards ──────────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {STATS.map((stat, i) => (
                <StatCard key={stat.label} {...stat} animationDelay={`${i * 65}ms`} />
              ))}
            </div>

            {/* ── Table controls ──────────────────────────────── */}
            <div
              className="flex flex-wrap items-center justify-between gap-4 mb-4 bg-white rounded-xl px-4 py-3"
              style={{ boxShadow: '0 1px 6px rgba(79,0,103,0.05)' }}
            >
              <div className="flex flex-wrap items-center gap-3">
                <FilterSelect options={['All statuses', 'Shortlisted', 'Interviewing', 'New', 'Rejected']} />
                <FilterSelect options={['All roles', 'Product Designer', 'Frontend Engineer', 'Marketing Lead']} />
                <FilterSelect options={['Score: high to low', 'Score: low to high']} />
              </div>
              <button
                className="flex items-center gap-1.5 text-[13px] font-semibold px-3 py-1.5 rounded-lg transition-all duration-150 active:scale-[0.97]"
                style={{ color: '#817282' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = '#4f0067'
                  e.currentTarget.style.background = '#faf0ff'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = '#817282'
                  e.currentTarget.style.background = ''
                }}
              >
                <span className="material-symbols-outlined text-[16px]">tune</span>
                Filters
              </button>
            </div>

            {/* ── Candidate table ─────────────────────────────── */}
            <CandidateTable candidates={CANDIDATES} />

            {/* ── Bottom cards ────────────────────────────────── */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 pb-10">

              {/* AI sourcing — image card */}
              <ImagePromoCard
                tag="AI-powered sourcing"
                title="Find your next hire"
                description="Match candidates against the performance profile of your top team members. Our engine surfaces talent you'd otherwise miss."
                cta="Start sourcing"
                imageSrc="https://lh3.googleusercontent.com/aida-public/AB6AXuCYCwxqlQhVxmNdujpppD6ydo9HdVvIQPJ2cNe3ptSPy6V8wxrHNbZtcq0QSNjtl4cbIV0gfRFtGxeudiBDJNcHO5LMzDfHew8sWTLea1LrtFONiT11FwSM-A00zKc-Kjbth4OSC4l5y2GoajgSixvZQsZV0snpoIAcnNhY3pavxs0md0y_GVhwCnsQzmXBUP9XEE8pwSIDvaTyOhSAVp_VZwnd1QaCL7bYpUFvgfeGTR6rcjXehNX-HFeZnlX72sE20HykgQX8oaqw"
                imageAlt="A team of recruiters collaborating in a bright modern office"
              />

              {/* Hiring trends */}
              <HiringTrendsCard />
            </div>
          </div>
        </main>

        {user?.id && <ChatWidget userId={user.id} />}
      </div>
    </>
  )
}
