import { useState } from 'react';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Butona basıldığında çalışacak olan 'Kurye' fonksiyonumuz
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    try {
      // fetch: React'ın yerleşik kuryesidir. Verileri paketleyip belirttiğimiz adrese götürür.
      const response = await fetch('http://localhost:5001/register', {
        method: 'POST', // Veri göndereceğimiz için POST metodunu kullanıyoruz
        headers: {
          'Content-Type': 'application/json', // Paketimizin JSON formatında olduğunu söylüyoruz
        },
        body: JSON.stringify({ username, email, password }), // Kullanıcının yazdıklarını JSON'a çevirip pakete koyuyoruz
      });

      // Backend'den (Node.js'ten) gelen cevabı açıp okuyoruz
      const data = await response.json();

      // Eğer backend bize '201 Created' veya '200 OK' gibi başarılı bir cevap döndüyse (response.ok):
      if (response.ok) {
        alert('🎉 Harika! ' + data.message); // Ekranda yukarıdan düşen bir uyarı (alert) göster
        // Kayıt başarılı olduğu için formdaki kutucukları temizleyelim
        setUsername('');
        setEmail('');
        setPassword('');
      } else {
        // Eğer backend bize 400 hatası döndüyse (örn: "Bu e-posta zaten var")
        alert('⚠️ Hata: ' + data.message); 
      }

    } catch (error) {
      // Eğer sunucu hiç çalışmıyorsa veya çöktüyse
      console.error("Bağlantı hatası:", error);
      alert('❌ Sunucuya ulaşılamadı. Backend çalışıyor mu?');
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px', width: '300px', margin: '20px' }}>
      <h2 style={{ textAlign: 'center' }}>Kayıt Ol</h2>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Kullanıcı Adı:</label>
          <input 
            type="text" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)} 
            required 
            style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>E-posta:</label>
          <input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            required 
            style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label>Şifre:</label>
          <input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            required 
            style={{ padding: '8px', marginTop: '5px', borderRadius: '4px', border: '1px solid #ccc' }}
          />
        </div>

        <button type="submit" style={{ padding: '10px', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', marginTop: '10px' }}>
          Kayıt Ol
        </button>
      </form>
    </div>
  );
}

export default Register;