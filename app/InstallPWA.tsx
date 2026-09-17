'use client'

import { useEffect, useState } from 'react'

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

export default function InstallPWA() {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null)
  const [showHelp, setShowHelp] = useState(false)

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault()
      setInstallEvent(event as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => setInstallEvent(null))

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' }).catch(() => {})
    }

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const install = async () => {
    if (installEvent) {
      await installEvent.prompt()
      await installEvent.userChoice
      setInstallEvent(null)
      return
    }
    setShowHelp(true)
  }

  return <>
    <button className="install-app" onClick={install} aria-label="Install GBK AI Marketplace">⬇ Install App</button>
    {showHelp && <div className="install-help-backdrop" onClick={() => setShowHelp(false)}><div className="install-help" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setShowHelp(false)}>×</button><span className="eyebrow">GBK AI MARKETPLACE</span><h2>Install the app</h2><p>On Android Chrome, use the browser menu and choose <strong>Install app</strong> or <strong>Add to Home screen</strong>. On iPhone, tap <strong>Share</strong>, then <strong>Add to Home Screen</strong>.</p><button className="primary" onClick={() => setShowHelp(false)}>Got it</button></div></div>}
  </>
}
