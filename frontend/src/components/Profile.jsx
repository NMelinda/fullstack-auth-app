import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Ana sistemden gelen 'setGirisYapildi' yetkisini içeri aldık
function Profile({ setGirisYapildi }) {
  const [kullanici, setKullanici] = useState(null); 
  const navigate = useNavigate(); 

  useEffect(() => {
    const kimlikKontrolu = async () => {
      try {
        const response = await fetch('http://localhost:5001/me', {
          credentials: 'include' 
        });
        if (response.ok) {
          const data = await response.json();
          setKullanici(data.user); 
        } else {
          setGirisYapildi(false); // Kaçak varsa menüyü düzelt
          navigate('/login');
        }
      } catch (error) {
        console.error("Bağlantı hatası:", error);
        setGirisYapildi(false);
        navigate('/login');
      }
    };
    kimlikKontrolu(); 
  }, [navigate, setGirisYapildi]);

  const cikisYap = async () => {
    try {
      await fetch('http://localhost:5001/logout', {
        method: 'POST',
        credentials: 'include'
      });
      // ÇIKIŞ BAŞARILI! Ana sisteme "Menüyü eski haline getir" diyoruz:
      setGirisYapildi(false);
      navigate('/login');
    } catch (error) {
      console.error("Çıkış yapılırken hata oluştu:", error);
    }
  };

  if (!kullanici) {
    return <div style={{ textAlign: 'center', marginTop: '50px' }}>Güvenlik kontrolü yapılıyor... ⏳</div>;
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', padding: '30px', border: '2px solid gold', borderRadius: '10px', display: 'inline-block', backgroundColor: '#fdfbf7' }}>
      <h2>👑 VIP Odaya Hoş Geldin, <span style={{ color: '#10b981' }}>{kullanici.username}</span>!</h2>
      <p>Sadece geçerli bir bilekliği olanlar bu yazıyı görebilir.</p>
      <hr style={{ margin: '20px 0', borderColor: '#eee' }} />
      <p style={{ marginBottom: '30px' }}><strong>Sisteme Kayıtlı E-postan:</strong> {kullanici.email}</p>
      
      <button onClick={cikisYap} style={{ padding: '10px 20px', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '16px' }}>
        🚪 Çıkış Yap
      </button>
    </div>
  );
}

export default Profile;