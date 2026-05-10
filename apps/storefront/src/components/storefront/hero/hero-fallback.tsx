"use client"

export function HeroFallback() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="absolute inset-0 atelier-grain opacity-70" />
      <div className="absolute -right-28 top-24 h-40 w-[34rem] -rotate-12 drop-shadow-[0_38px_34px_rgba(0,0,0,0.42)] sm:right-0 sm:top-20 lg:right-10 lg:top-24">
        <div className="absolute left-0 top-14 h-16 w-[26rem] rounded-[0.35rem] bg-[linear-gradient(90deg,oklch(0.16_0.02_60),oklch(0.54_0.09_62)_20%,oklch(0.84_0.13_79)_50%,oklch(0.48_0.08_55)_78%,oklch(0.14_0.02_60))] shadow-[inset_0_8px_12px_rgba(255,255,255,0.18),inset_0_-12px_16px_rgba(0,0,0,0.35)]" />
        <div className="clip-pencil-tip absolute left-[25rem] top-7 h-28 w-32 bg-[linear-gradient(90deg,oklch(0.68_0.08_76),oklch(0.94_0.08_86)_45%,oklch(0.38_0.06_54))]" />
        <div className="clip-pencil-point absolute left-[31.5rem] top-[3.75rem] h-12 w-16 bg-[oklch(0.13_0.02_55)]" />
        <div className="absolute left-8 top-[4.35rem] h-1.5 w-72 rounded-full bg-white/25" />
      </div>
    </div>
  )
}
