
import React from 'react';
import { createRoot } from 'react-dom/client';
import DwntwnaChat from './components/DwntwnaChat';
import './index.css';

const rootElement = document.getElementById('dwntwna-chat-root');
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<DwntwnaChat />);
}
