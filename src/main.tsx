import './style.css'
import './rise-wallet.config.ts'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'

const container = document.querySelector<HTMLDivElement>('#app')!
const root = createRoot(container)

root.render(<App />)
