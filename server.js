const express = require('express');
const cors = require('cors');
require('dotenv').config();
const bcrypt = require('bcrypt');
const pool = require('./db'); 

// --- YENİ EKLENEN: SESSION PAKETLERİ ---
const session = require('express-session');
const pgSession = require('connect-pg-simple')(session); // Sessionları Postgres'e kaydetmek için

const app = express();

// React'ın (5173) bize VIP bileklik (çerez) göndermesine özel izin veriyoruz.
app.use(cors({
    origin: 'http://localhost:5173', // Sadece bizim React masamıza izin ver
    credentials: true // VIP bileklikleri (çerezleri) kabul et
}));
app.use(express.json());

// --- YENİ EKLENEN: SESSION AYARLARI ---
// Bu blok, sitemize gelen herkes için bir oturum kontrolörü başlatır.
app.use(session({
    // Oturum bilgilerini hafızada değil, oluşturduğumuz veritabanı tablosunda tut diyoruz.
    store: new pgSession({
        pool: pool, // Veritabanı bağlantımız
        tableName: 'session' // İlk gün DBeaver'da oluşturduğumuz tablonun adı
    }),
    secret: process.env.SESSION_SECRET, // .env dosyasındaki gizli şifremizle mühürlüyoruz
    resave: false, 
    saveUninitialized: false, // Sadece giriş yapan kullanıcılar için session oluştur (boş yere veritabanını doldurma)
    cookie: { 
        maxAge: 30 * 24 * 60 * 60 * 1000 // Çerezin ömrü: 30 Gün (milisaniye cinsinden)
    }
}));

// KAYIT OL ROTASI (Değişiklik yok)
app.post('/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const userCheck = await pool.query('SELECT * FROM users WHERE email = $1 OR username = $2', [email, username]);
        if (userCheck.rowCount > 0) {
            return res.status(400).json({ message: 'Bu kullanıcı adı veya e-posta zaten kullanımda.' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, hashedPassword]
        );

        res.status(201).json({ message: 'Kayıt işlemi çok başarılı!', user: newUser.rows[0] });
    } catch (error) {
        console.error('Kayıt olurken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});

// GİRİŞ YAP ROTASI (Session eklendi!)
// GİRİŞ YAP ROTASI 
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const userResult = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (userResult.rowCount === 0) {
            return res.status(400).json({ message: 'Böyle bir e-posta adresi sistemde bulunamadı.' });
        }

        const user = userResult.rows[0];
        const isPasswordValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Şifreniz yanlış, lütfen tekrar deneyin.' });
        }

        // Şifre doğruysa oturum bilgilerini hazırla
        req.session.user = {
            id: user.id,
            username: user.username,
            email: user.email
        };

        // EN KRİTİK YER: Veritabanına (%100) yazılmadan React'a cevap verme!
        req.session.save((err) => {
            if (err) {
                console.error('Oturum kaydedilemedi:', err);
                return res.status(500).json({ message: 'Oturum hatası.' });
            }
            // Kayıt tamamen bittikten sonra React'a 'Başarılı' de:
            res.status(200).json({
                message: 'Giriş başarılı! Hoş geldin.',
                user: req.session.user
            });
        });

    } catch (error) {
        console.error('Giriş yaparken hata:', error);
        res.status(500).json({ message: 'Sunucu hatası.' });
    }
});
// --- YENİ EKLENEN: KORUMALI ROTA (Sadece giriş yapanlar görebilir) ---

// '/profil' adresine bir GET isteği (sayfayı görüntüleme) geldiğinde çalışır
app.get('/profil', (req, res) => {
    
    // 1. KONTROL: Kullanıcının geçerli bir oturumu (VIP bilekliği) var mı?
    if (req.session.user) {
        // Eğer varsa, kapıları aç ve bilgilerini göster
        res.status(200).json({
            message: 'Gizli profil sayfasına başarıyla ulaştın!',
            kullaniciBilgileri: req.session.user
        });
    } else {
        // Eğer yoksa (giriş yapmamışsa), 401 (Yetkisiz) hatası verip kapıdan çevir
        res.status(401).json({ message: 'Dur! Bu sayfayı görmek için önce giriş yapmalısın.' });
    }
});

app.get('/me', (req, res) => {
    if(req.session.user) {
        res.status(200).json({ user: req.session.user });
    } else {
        res.status(401).json({ message: 'Yetkisiz erişim! Lütfen Giriş Yapın.' });
    };
});

app.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if(err) {
            console.error('Çıkış hatası:', err);
            return res.status(500).json({ message: 'Çıkış yapılamadı.' });
        }
        res.clearCookie('connect.sid');
        res.status(200).json({ message: 'Çıkış başarılı!' });
        });
    });

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
    console.log(`🚀 Sunucu http://localhost:${PORT} portunda çalışmaya başladı!`);
});