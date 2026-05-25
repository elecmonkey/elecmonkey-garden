import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app-shell';
import 'katex/dist/katex.min.css';
import './app/globals.css';
import './styles/syntax-highlighter-override.css';

const root = document.getElementById('root');

if (!root) {
  throw new Error('Missing #root element for Garden client entry.');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
