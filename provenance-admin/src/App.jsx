import { useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import Dashboard from './Pages/Dashboard'
import Login from './Pages/Login'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem('adminLoggedIn') === 'true'
  );

  if (!isAuthenticated) {
    return (
      <Login
        onLogin={() => {
          localStorage.setItem('adminLoggedIn', 'true');
          setIsAuthenticated(true);
        }}
      />
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </>
  )
}

export default App
