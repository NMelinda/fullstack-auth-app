import { useState, useEffect } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';

import Register from './components/Register'; 
import Login from './components/Login'; 
import Profile from './components/Profile'; 

function App() {
  const [girisYapildi, setGirisYapildi] = useState(false);

  useEffect(() => {
    fetch('http://localhost:5001/me', { credentials: 'include' })
      .then(res => { if(res.ok) setGirisYapildi(true); })
      .catch(() => setGirisYapildi(false));
  }, []);

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        
        <nav style={{ backgroundColor: '#333', width: '100%', padding: '15px 0', textAlign: 'center', marginBottom: '40px' }}>
          <Link to="/" style={{ color: 'white', textDecoration: 'none', margin: '0 15px', fontSize: '18px' }}>Ana Sayfa</Link>
          
          {!girisYapildi ? (
            <>
              <Link to="/register" style={{ color: 'white', textDecoration: 'none', margin: '0 15px', fontSize: '18px' }}>Kayıt Ol</Link>
              <Link to="/login" style={{ color: 'white', textDecoration: 'none', margin: '0 15px', fontSize: '18px' }}>Giriş Yap</Link>
            </>
          ) : (
            <Link to="/profil" style={{ color: 'white', textDecoration: 'none', margin: '0 15px', fontSize: '18px' }}>👑 VIP Odam</Link>
          )}
        </nav>

        <Routes>
          <Route path="/" element={<h2>Sitemize Hoş Geldiniz! 🚀 Lütfen yukarıdan bir işlem seçin.</h2>} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login setGirisYapildi={setGirisYapildi} />} />
          <Route path="/profil" element={<Profile setGirisYapildi={setGirisYapildi} />} />
        </Routes>

      </div>
    </Router>
  );
}

export default App;