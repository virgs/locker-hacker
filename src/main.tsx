import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootswatch/dist/cyborg/bootstrap.min.css'
import App from './App.tsx'
import { GameProvider } from './context/GameContext.tsx'
import { IS_CAPACITOR } from './platform.ts'
import { initializeAds } from './ads/AdService.ts'
import './index.css'

if (IS_CAPACITOR) {
    initializeAds().catch(console.error);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameProvider>
      <App />
    </GameProvider>
  </React.StrictMode>,
)
