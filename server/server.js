const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const morgan = require("morgan");
const multer = require("multer");
const fs = require("fs");

//------------------------- Morgan ------------------------
app.use(morgan("dev"));
// --------------------------------------------------------

//-------------------- Express js server Config -----------
app.use(express.json({ limit: "50mb" }));
app.use(cors());
// --------------------------------------------------------

//--------------------- Express js Server ------------------
const port = 3000;
app.listen(port, () => {
  console.log("Server Worked");
});
// ---------------------------------------------------------

// Models
const videoSchema = new mongoose.Schema({
  name: String,
  data: Buffer,
  path: String,
});

// Model oluşturma
const Video = mongoose.model("Video", videoSchema);

// ------------------------------------

// Multer

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });
// -----------------------------

app.post("/videoUpload", upload.single("video"), async (req, res) => {
  const video = new Video({
    name: req.file.originalname,
    data: fs.readFileSync(req.file.path),
    path: req.file.path,
  });

  try {
    await video.save();
    res.status(200).send("Video uploaded successfully!");
  } catch (error) {
    console.error("Error saving video to database:", error);
    res.status(500).send("Error uploading video");
  }
});

app.get("/videos", async (req, res) => {
  try {
    const videos = await Video.find();
    res.json(videos);
  } catch (error) {
    console.error("Error fetching videos:", error);
    res.status(500).send("Error fetching videos");
  }
});

app.get("/videos/:id", async (req, res) => {
  const videoId = req.params.id;

  try {
    const video = await Video.findById(videoId);
    const videoPath = video.path;

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

      const chunksize = end - start + 1;
      const file = fs.createReadStream(videoPath, { start, end });

      const head = {
        "Content-Range": `bytes ${start}-${end}/${fileSize}`,
        "Accept-Ranges": "bytes",
        "Content-Length": chunksize,
        "Content-Type": "video/mp4",
      };

      res.writeHead(206, head);
      file.pipe(res);
    } else {
      const head = {
        "Content-Length": fileSize,
        "Content-Type": "video/mp4",
      };

      res.writeHead(200, head);
      fs.createReadStream(videoPath).pipe(res);
    }
  } catch (error) {
    console.error("Error fetching video:", error);
    res.status(500).send("Error fetching video");
  }
});

//-------------------- DataBase mongoDB --------------------
mongoose.set("strictQuery", true);

mongoose
  .connect(
    "mongodb+srv://ShahriyarMammadov:sehriyar123@cluster0.xjblasa.mongodb.net/?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("DataBase Connected");
  })
  .catch((err) => {
    console.log(err);
  });
// -------------------------------------------------------
