const express = require("express");
const multer = require("multer");
const cors = require("cors");
const mysql = require("mysql");
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieParser = require ('cookie-parser')
const session = require('express-session');


const path = require('path');
const app = express();
const { error } = require("console");
const saltRound = 10;

app.use(cors({
  origin: 'http://localhost:5173',
  methods:["GET", "POST", "DELETE"],
  credentials: true,
}));

app.use(cookieParser());
app.use(session({
  key:"userId",
  secret: 'cinukk',
  resave: false,
  saveUninitialized: false,
  cookie:{
    expires: 60 * 60 * 24,  
  }
}));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Koneksi ke database MySQL
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cyclecare2"
});
db.connect((err) => {
  if (err) {
    console.error("Error connecting to database:", err);
    return;
  }
  console.log("Connected to MySQL database");
});

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, 'src', 'assets', 'gambar'));
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});
const upload = multer({ storage: storage });
// File dari direktori gambar
app.use('/assets/gambar', express.static(path.join(__dirname, 'src', 'assets', 'gambar')));


app.get("/Admin/artikel", (req, res) => {
  const sql = "SELECT * FROM artikel";
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      return res.json({ error: "Error executing SQL query" });
    }
    return res.json(data);
  });
});
app.get("/Admin/video", (req, res) => {
  const sql = "SELECT * FROM video";
  db.query(sql, (err, data) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      return res.json({ error: "Error executing SQL query" });
    }
    return res.json(data);
  });
});
app.get('/Admin/brandMotor', (req, res) => {
  const sql = 'SELECT * FROM brand_motor';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(results);
    }
  });
});
app.get('/Admin/tipeMotor', (req, res) => {
  const sql = 'SELECT * FROM tipe_motor';
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching data from database:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(result);
    }
  });
});
app.get('/Admin/seriMotor', (req, res) => {
  const sql = `
    SELECT
      seri_motor.id,
      seri_motor.nama,
      seri_motor.deskripsi,
      brand_motor.nama AS brand_motor,
  tipe_motor.nama AS tipe_motor
    FROM
      seri_motor
    INNER JOIN
      brand_motor ON seri_motor.brand_motor = brand_motor.id
    INNER JOIN
      tipe_motor ON seri_motor.tipe_motor = tipe_motor.id
  `;
  db.query(sql, (err, result) => {
    if (err) {
      console.error('Error fetching seri motor data:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json(result);
    }
  });
});
app.get("/Admin/totalvideos", (req, res) => {
  const sql = "SELECT COUNT(*) AS total_videos FROM video";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      return res.json({ error: "Error executing SQL query" });
    }
    const totalVideos = result[0].total_videos;
    return res.json({ totalVideos });
  });
});
app.get("/Admin/totalartikel", (req, res) => {
  const sql = "SELECT COUNT(*) AS total_artikel FROM artikel";
  db.query(sql, (err, result) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      return res.json({ error: "Error executing SQL query" });
    }
    const totalArtikel = result[0].total_artikel;
    return res.json({ totalArtikel });
  });
});


app.post("/Admin/tambahartikel", upload.single('foto'), (req, res) => {
  const judul_artikel = req.body.judul_artikel;
  const foto = req.file.filename; // Nama file gambar yang diunggah

  const sql = "INSERT INTO artikel (`judul_artikel`, `foto`) VALUES (?, ?)";
  const values = [judul_artikel, foto];

  db.query(sql, values, (err, data) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      return res.json({ error: "Error executing SQL query" });
    }
    return res.json(data);
  });
});
app.post("/Admin/tambahvideo", upload.single('thumbnail'), (req, res) => {
  const judul_video = req.body.judul_video;
  const link = req.body.link;
  const thumbnail = req.file.filename;

  const sql = "INSERT INTO video (`judul_video`, `link`, `thumbnail`) VALUES (?, ?, ?)";
  const values = [judul_video, link, thumbnail];

  db.query(sql, values, (err, data) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      return res.json({ error: "Error executing SQL query" });
    }
    return res.json(data);
  });
});
app.post('/Admin/brandMotor', (req, res) => {
  const { nama, deskripsi } = req.body;
  const sql = 'INSERT INTO brand_motor (nama, deskripsi) VALUES (?, ?)';
  db.query(sql, [nama, deskripsi], (err, result) => {
    if (err) {
      console.error('Error inserting into database:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const newBrand = { id: result.insertId, nama, deskripsi };
      res.json(newBrand);
    }
  });
});
app.post('/Admin/tipeMotor', (req, res) => {
  const { nama, deskripsi } = req.body;
  const sql = 'INSERT INTO tipe_motor (nama, deskripsi) VALUES (?, ?)';
  db.query(sql, [nama, deskripsi], (err, result) => {
    if (err) {
      console.error('Error inserting into database:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const newTipe = { id: result.insertId, nama, deskripsi };
      res.json(newTipe);
    }
  });
});
app.post('/Admin/seriMotor', (req, res) => {
  const { nama, deskripsi, tipeMotorId, brandMotorId } = req.body;
  const sql = 'INSERT INTO seri_motor (nama, deskripsi, tipe_motor, brand_motor) VALUES (?, ?, ?, ?)';
  db.query(sql, [nama, deskripsi, tipeMotorId, brandMotorId], (err, result) => {
    if (err) {
      console.error('Error inserting into database:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      const newSeriMotor = { id: result.insertId, nama, deskripsi, tipeMotorId, brandMotorId };
      res.json(newSeriMotor);
    }
  });
});
app.post('/register', (req, res) => {
  const { firstname, lastname, username, email, password } = req.body;
  const jenis_user_id = 2;

  if (!firstname || !lastname || !username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  bcrypt.hash(password, saltRound, (err, hash) => {
    if (err){
      console.log(err);
    }
    const query = 'INSERT INTO user (email, password, username, first_name, last_name, jenis_user) VALUES (?, ?, ?, ?, ?, ?)';
    db.query(query, [email, hash, username, firstname, lastname, jenis_user_id], (err, result) => {
      if (err) {
        console.error('Error during registration:', err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }

      res.status(200).json({ message: 'Registration successful' });
    });
  })

});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  db.query(
    "SELECT * FROM user WHERE email = ?;",
    email,
    (err, result) => {
      if (err) {
        console.log(err);
      }

      if (result.length > 0) {
        bcrypt.compare(password, result[0].password, (error, response) => {
          if (response) {
            req.session.user = result;
            console.log(req.session.user)
            res.send(result);
          } else {
            res.send({ message: "Wrong username or password" });
          }
        });
      } else {
        res.send({ message: "User doesn't exist" });
      }
    }
  );
});






app.delete("/Admin/artikel/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM artikel WHERE id = ?";
  db.query(sql, [id], (err, data) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      return res.json({ error: "Error executing SQL query" });
    }
    return res.json(data);
  });
});
app.delete("/Admin/video/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM video WHERE id = ?";
  db.query(sql, [id], (err, data) => {
    if (err) {
      console.error("Error executing SQL query:", err);
      return res.json({ error: "Error executing SQL query" });
    }
    return res.json(data);
  });
});
app.delete('/Admin/brandMotor/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM brand_motor WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data from database:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ success: true });
    }
  });
});
app.delete('/Admin/tipeMotor/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM tipe_motor WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data from database:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ success: true });
    }
  });
});
app.delete('/Admin/seriMotor/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM seri_motor WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error('Error deleting data from database:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    } else {
      res.json({ success: true });
    }
  });
});


const PORT = process.env.PORT || 8082;
// Mmemulai server pada port 8082
app.listen(PORT, () => {
  console.log('Server aktif...');
});
