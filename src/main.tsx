
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/disableRealtime'
import './utils/iOSDebugLogger'

createRoot(document.getElementById("root")!).render(<App />);
