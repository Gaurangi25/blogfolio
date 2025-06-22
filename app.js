import express from "express";
import ejs from "ejs";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import multer from "multer";
import fs from "fs";

const app = express();
const port = 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadsDir = path.join(__dirname, "public/uploads");

//To delete an image everytime i refresh
fs.readdir(uploadsDir, (err, files) => {
  if (err) {
    console.error("Error reading uploads folder:", err);
    return;
  }

  for (const file of files) {
    fs.unlink(path.join(uploadsDir, file), (err) => {
      if (err) console.error("Error deleting file:", file);
    });
  }

  console.log("Uploads folder cleaned.");
});

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
    id: Date.now(), //this acts as a unique id
    title: req.body.title,
    content: req.body.content,
    image: req.file ? "/uploads/" + req.file.filename : null,
  };

  posts.push(post); //save the current post in the array or memory

  res.redirect("/");
});

//edit a post
app.get("/edit/:id", (req, res) => {
  const id = parseInt(req.params.id);
  console.log("id : " + id); //this is a string

  const post = posts.find((p) => p.id === id);

  if (!post) return res.send("Post not found..");

  res.render("edit.ejs", { post });
});

app.post("/edit/:id", upload.single("image"), (req, res) => {
  const id = parseInt(req.params.id);
  const postIndex = posts.findIndex((p) => p.id === id);

  if (postIndex === -1) return res.send("Post not found..");

  posts[postIndex].title = req.body.title;
  posts[postIndex].content = req.body.content;

  //update image only if new image is uploaded
  if (req.file) {
    posts[postIndex].image = "/uploads/" + req.file.filename;
  }

  res.redirect("/");
});

app.post("/delete/:id", (req, res) => {
  const id = parseInt(req.params.id);
  const index = posts.findIndex((p) => p.id === id);
  if (index == -1) return res.send("Post not found..");

  posts.splice(index, 1);

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Server Running on port ${port}..`);
});
