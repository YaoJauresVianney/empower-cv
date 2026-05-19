import { useState } from 'react'
import ProgressBar from './ProgressBar'

const STATUS_CONFIG = {
  Shortlisted: { dot: '#7b00a0', bg: '#faf0ff', text: '#4f0067' },
  Interviewing: { dot: '#2563eb', bg: '#eff6ff', text: '#1d4ed8' },
  New: { dot: '#737373', bg: '#f5f5f5', text: '#404040' },
  Rejected: { dot: '#dc2626', bg: '#fef2f2', text: '#dc2626' },
}

const TABLE_COLUMNS = [
  { label: 'Candidate', cls: '' },
  { label: 'Role', cls: '' },
  { label: 'Status', cls: '' },
  { label: 'Match score', cls: 'text-center' },
  { label: 'Applied', cls: '' },
  { label: '', cls: '' },
]

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] ?? { dot: '#737373', bg: '#f5f5f5', text: '#404040' }
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[12px] font-semibold"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {status}
    </span>
  )
}

function ScoreBar({ score }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span
        className="text-[14px] leading-5 font-bold text-[#4f0067] tabular-nums"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {score}%
      </span>
      <ProgressBar value={score} className="w-24" />
    </div>
  )
}

function CandidateRow({ candidate }) {
  const [hovered, setHovered] = useState(false)

  return (
    <tr
      className="transition-colors duration-150 group"
      style={{ backgroundColor: hovered ? 'rgba(250, 240, 255, 0.6)' : undefined }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg overflow-hidden border border-[#d3c1d2]/60 flex-shrink-0">
            <img
              alt={candidate.name}
              src={candidate.avatar}
              className="w-full h-full object-cover transition-transform duration-200"
              style={{ transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
            />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-[#1b1b1b] leading-snug">{candidate.name}</p>
            <p className="text-[12px] text-[#817282] mt-0.5">{candidate.email}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-[14px] font-medium text-[#4f4351]">{candidate.role}</td>
      <td className="px-6 py-4">
        <StatusBadge status={candidate.status} />
      </td>
      <td className="px-6 py-4">
        <ScoreBar score={candidate.score} />
      </td>
      <td
        className="px-6 py-4 text-[13px] text-[#817282] tabular-nums"
        style={{ fontVariantNumeric: 'tabular-nums' }}
      >
        {candidate.date}
      </td>
      <td className="px-6 py-4">
        <button
          className="p-1.5 hover:bg-[#ede4ef] active:scale-[0.95] rounded-lg text-[#817282] hover:text-[#4f0067] transition-all duration-150"
          style={{ opacity: hovered ? 1 : 0 }}
          aria-label={`More options for ${candidate.name}`}
        >
          <span className="material-symbols-outlined text-[20px]">more_horiz</span>
        </button>
      </td>
    </tr>
  )
}

export default function CandidateTable({ candidates }) {
  return (
    <div
      className="bg-white rounded-2xl overflow-hidden"
      style={{ boxShadow: '0 2px 20px rgba(79,0,103,0.07)' }}
    >
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(211,193,210,0.5)' }}>
              {TABLE_COLUMNS.map(({ label, cls }) => (
                <th
                  key={label}
                  className={`px-6 py-3.5 text-[11px] font-semibold uppercase tracking-[0.06em] ${cls}`}
                  style={{ color: '#9c8fa0' }}
                >
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ borderTop: 'none' }}>
            {candidates.map((c) => (
              <CandidateRow key={c.id} candidate={c} />
            ))}
          </tbody>
        </table>
      </div>

      <div
        className="flex items-center justify-between px-6 py-3.5"
        style={{ borderTop: '1px solid rgba(211,193,210,0.4)' }}
      >
        <p className="text-[12px] font-medium" style={{ color: '#9c8fa0' }}>
          Showing 1–{candidates.length} of 1,284 candidates
        </p>
        <div className="flex items-center gap-1.5">
          <button
            className="p-1.5 rounded-lg transition-all duration-150 active:scale-[0.94]"
            style={{ border: '1px solid rgba(211,193,210,0.8)', color: '#817282' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#faf0ff')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '')}
            aria-label="Previous page"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_left</span>
          </button>
          <button
            className="w-8 h-8 rounded-lg text-[13px] font-bold text-white transition-all duration-150"
            style={{ background: '#4f0067' }}
          >
            1
          </button>
          {['2', '3'].map((n) => (
            <button
              key={n}
              className="w-8 h-8 rounded-lg text-[13px] font-semibold transition-all duration-150 active:scale-[0.94]"
              style={{ color: '#817282' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = '#faf0ff')}
              onMouseLeave={(e) => (e.currentTarget.style.background = '')}
            >
              {n}
            </button>
          ))}
          <button
            className="p-1.5 rounded-lg transition-all duration-150 active:scale-[0.94]"
            style={{ border: '1px solid rgba(211,193,210,0.8)', color: '#817282' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#faf0ff')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '')}
            aria-label="Next page"
          >
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  )
}
