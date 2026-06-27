import { AppShell } from '@/components/app-shell'
import Galaxy from '@/components/Galaxy'

export default function Page() {
  return (
    <main className="relative min-h-svh">
      <div className="fixed inset-0 -z-10">
        <Galaxy
          mouseRepulsion
          mouseInteraction
          density={1}
          glowIntensity={0.3}
          saturation={0}
          hueShift={140}
          twinkleIntensity={0.3}
          rotationSpeed={0.1}
          repulsionStrength={2}
          autoCenterRepulsion={0}
          starSpeed={0.5}
          speed={1}
          transparent
        />
      </div>
      <AppShell />
    </main>
  )
}