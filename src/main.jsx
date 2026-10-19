import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { StoreProvider } from './store.jsx'
import { AuthGate } from './Login.jsx'
import { cloud } from './firebase.js'
import './styles.css'
const app = <StoreProvider><App /></StoreProvider>
createRoot(document.getElementById('root')).render(<BrowserRouter>{cloud ? <AuthGate>{app}</AuthGate> : app}</BrowserRouter>)