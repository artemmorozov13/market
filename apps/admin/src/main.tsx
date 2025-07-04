import { createRoot } from 'react-dom/client'
import 'react-toastify/dist/ReactToastify.css';
import { App } from './app/ui/App';

createRoot(document.getElementById('root')!).render(
    <App />
)
