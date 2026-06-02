import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// DİKKAT: Ana sistemden gelen 'setGirisYapildi' yetkisini içeri aldık
function Login({ setGirisYapildi }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    try {
      const response = await fetch('http://localhost:5001/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
        credentials: 'include' 
      });

      const data = await response.json();

      if (response.ok) {
        // GİRİŞ BAŞARILI! Ana sisteme "Menüyü değiştir" diyoruz:
        setGirisYapildi(true);
        navigate('/profil'); 
      } else {
        alert('⚠️ Hata: ' + data.message); 
      }
    } catch (error) {
      console.error("Bağlantı hatası:", error);
      alert('❌ Sunucuya ulaşılamadı. Backend çalışıyor mu?');
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', width: '300px', margin: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Giriş Yap</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>E-posta:</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Şifre:</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }} />
        </div>
        <button type="submit" style={{ padding: '10px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
          Giriş Yap
        </button>
      </form>
    </div>
  );
}

export default Login;