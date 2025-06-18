import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

let posts = [];

app.get("/", (req, res) => {
  res.render("home", { posts });
});

//create a post form
app.get("/form", (req, res) => {
  res.render("form.ejs");
});

app.post("/form", upload.single("image"), (req, res) => {
  const post = {
    title: req.body.title,
    content: req.body.content,
    image: req.file ? "/uploads/" + req.file.filename : null,
  };

  posts.push(post); //save the current post in the array or memory

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server Running on port ${port}..`);
});
