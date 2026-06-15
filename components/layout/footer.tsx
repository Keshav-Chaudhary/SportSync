'use client'

import { useState, useRef, useEffect } from 'react'
import { Dumbbell, Github, ChevronDown, Code2, FlaskConical, BookOpen } from 'lucide-react'

const TEAM = [
  {
    initials: 'KC',
    name: 'Keshav Chaudhary',
    role: 'full-stack engineer',
    badge: 'LEAD DEV',
    highlight: true,
    icon: Code2,
    skills: ['Next.js · React · Tailwind', 'MySQL · Node.js · Auth', 'UI/UX · DB Design · API'],
    github: 'https://github.com',
  },
  {
    initials: 'KS',
    name: 'Krishna Saini',
    role: 'researcher',
    badge: null,
    highlight: false,
    icon: FlaskConical,
    skills: ['DB Schema Research · QA Tester', 'Requirements Analysis', 'Documentation'],
    github: 'https://github.com',
  },
  {
    initials: 'MK',
    name: 'Mithik Kaul',
    role: 'researcher',
    badge: null,
    highlight: false,
    icon: BookOpen,
    skills: ['QA Tester · Domain Research', 'Use Case Modelling', 'Presentation'],
    github: 'https://github.com',
  },
]

export function Footer() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const footerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (open) {
      // slight delay so max-height transition starts before scroll
      const t = setTimeout(() => {
        contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 120)
      return () => clearTimeout(t)
    }
  }, [open])

  // stagger-mount cards after open
  useEffect(() => {
    if (open) {
      const t = setTimeout(() => setMounted(true), 50)
      return () => clearTimeout(t)
    } else {
      setMounted(false)
    }
  }, [open])

  return (
    <footer ref={footerRef} className="border-t border-border bg-background/80 backdrop-blur">

      {/* ── Toggle bar ── */}
      <div className="max-w-6xl mx-auto px-6 pt-5 pb-2">
        <button
          onClick={() => setOpen(!open)}
          className="w-full group flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors duration-200 font-medium"
        >
          <div className="flex items-center gap-2">
            <span className="tracking-wide">Meet the Team</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-muted-foreground/60 group-hover:text-muted-foreground transition-colors duration-200">
              {open ? 'Hide' : 'Show'}
            </span>
            <div className={`rounded border border-border p-0.5 transition-all duration-300 group-hover:border-primary/40 group-hover:bg-primary/5 ${open ? 'rotate-180 border-primary/30 bg-primary/5' : ''}`}>
              <ChevronDown className="h-3.5 w-3.5" />
            </div>
          </div>
        </button>
      </div>

      {/* ── Collapsible content ── */}
      <div
        style={{ maxHeight: open ? '2000px' : '0px' }}
        className="overflow-hidden transition-[max-height] duration-500 ease-in-out"
      >
        <div ref={contentRef} className="max-w-6xl mx-auto px-6 pt-4 pb-8">

          {/* scan-line header */}
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px flex-1 bg-gradient-to-r from-border to-transparent" />
            <span className="text-xs text-muted-foreground/50 tracking-widest uppercase font-medium">
              Contributors · DBMS · {new Date().getFullYear()}
            </span>
            <div className="h-px flex-1 bg-gradient-to-l from-border to-transparent" />
          </div>

          {/* Dev cards */}
          <div className="grid gap-4 sm:grid-cols-3">
            {TEAM.map((dev, i) => {
              const Icon = dev.icon
              const delay = `${i * 80}ms`

              return (
                <div
                  key={dev.name}
                  style={{
                    transitionDelay: delay,
                    opacity: mounted ? 1 : 0,
                    transform: mounted ? 'translateY(0)' : 'translateY(12px)',
                  }}
                  className={`relative rounded-xl p-4 transition-all duration-500 ${
                    dev.highlight
                      ? 'border border-primary/40 bg-primary/5 hover:bg-primary/10 hover:border-primary/60'
                      : 'border border-border bg-card/50 hover:border-border/80 hover:bg-card/80'
                  }`}
                >
                  {/* badge */}
                  {dev.badge && (
                    <div className="absolute -top-2.5 left-4">
                      <span className="font-mono text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded tracking-widest">
                        {dev.badge}
                      </span>
                    </div>
                  )}

                  {/* header row */}
                  <div className="flex items-center gap-3 mt-1">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 font-mono text-xs font-bold transition-colors ${
                      dev.highlight
                        ? 'border border-primary/50 bg-primary/20 text-primary'
                        : 'border border-border bg-muted/30 text-muted-foreground'
                    }`}>
                      {dev.initials}
                    </div>
                    <div className="min-w-0">
                      <p className="font-mono text-sm font-bold text-foreground leading-tight">{dev.name}</p>
                      <div className="flex items-center gap-1 mt-0.5">
                        <Icon className={`h-3 w-3 flex-shrink-0 ${dev.highlight ? 'text-primary' : 'text-muted-foreground/60'}`} />
                        <p className={`font-mono text-[11px] ${dev.highlight ? 'text-primary' : 'text-muted-foreground'}`}>
                          {dev.role}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* divider */}
                  <div className="my-3 border-t border-border/50" />

                  {/* skill rows */}
                  <div className="space-y-1.5">
                    {dev.skills.map((s) => (
                      <div key={s} className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
                        <span className={`flex-shrink-0 ${dev.highlight ? 'text-primary/60' : 'text-muted-foreground/30'}`}>▸</span>
                        {s}
                      </div>
                    ))}
                  </div>

                  {/* github link */}
                  <a
                    href={dev.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] transition-colors duration-200 ${
                      dev.highlight
                        ? 'text-primary/60 hover:text-primary'
                        : 'text-muted-foreground/40 hover:text-muted-foreground'
                    }`}
                  >
                    <Github className="h-3.5 w-3.5" />
                    github profile
                  </a>
                </div>
              )
            })}
          </div>

          {/* meta line
          <div className="mt-6 flex flex-wrap items-center gap-3 font-mono text-xs text-muted-foreground/40">
            <span className="text-primary/40">//</span>
            <span>DBMS Course Project</span>
            <span className="text-border">·</span>
            <span>B.Tech </span>
            <span className="text-border">·</span>
            <span>{new Date().getFullYear()}</span>
          </div> */}

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className={`border-t border-border px-6 py-4 max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 transition-colors duration-300 ${open ? 'border-primary/20' : ''}`}>

        <div className="flex items-center gap-2 text-sm font-semibold">
          <Dumbbell className="h-4 w-4 text-primary" />
          <span className="text-foreground">SportSync</span>
        </div>

        <p className="text-sm text-muted-foreground/80 text-center font-medium">
          Sports Equipment Lending & Gym Entry Management System
        </p>

        <div className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground/50">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400/70 inline-block" />
          SYSTEM OK
        </div>

      </div>
    </footer>
  )
}   