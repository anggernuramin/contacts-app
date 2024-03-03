import express from "express";
import expressLayouts from "express-ejs-layouts";
import cookieParser from "cookie-parser";
import session from "express-session";
import flash from "connect-flash";
import { body, check, validationResult } from "express-validator";
import methodOverride from "method-override";
const app = express();
const port = "3000";

import connectDb from "./utils/db.mjs"; // connect database
import Contact from "./model/contacts.mjs"; // schema database

// start middleware
app.use(express.static("public"));
app.use(expressLayouts);
app.set("view engine", "ejs");

// create flash message
app.use(flash());
app.use(cookieParser());
app.use(
  session({
    cookie: { maxAge: 60000 },
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);
// end falsh message
app.use(express.urlencoded({ extended: true })); // mengambil value dari form
app.use(methodOverride("_method")); // package digunakan untuk menoverride http
// end middleware

// halaman home
app.get("/", (req, res) => {
  const defaultContacts = [
    {
      name: "Angger Nur Amin",
      email: "anggern514@gmail.com",
      nohp: "088989410007",
    },
    {
      name: "John doe",
      email: "johndoe.com",
      nohp: "08827389279832",
    },
    {
      name: "Angger Nur Amin",
      email: "anggern514@gmail.com",
      nohp: "088989410007",
    },
    {
      name: "John doe",
      email: "johndoe.com",
      nohp: "08827389279832",
    },
    {
      name: "Angger Nur Amin",
      email: "anggern514@gmail.com",
      nohp: "088989410007",
    },
    {
      name: "John doe",
      email: "johndoe.com",
      nohp: "08827389279832",
    },
    {
      name: "Angger Nur Amin",
      email: "anggern514@gmail.com",
      nohp: "088989410007",
    },
    {
      name: "John doe",
      email: "johndoe.com",
      nohp: "08827389279832",
    },
  ];
  res.render("index", {
    url: req.url,
    title: "Home Page",
    layout: "layouts/main-layout",
    contacts: defaultContacts,
  });
});

// halaman about
app.get("/about", (req, res) => {
  res.render("about", {
    title: "About Page",
    url: req.url,
    layout: "layouts/main-layout",
  });
});

// halaman contact
app.get("/contact", async (req, res) => {
  // Contact adalah nama collection
  const contacts = await Contact.find();

  res.render("contact", {
    title: "Page Contact",
    layout: "layouts/main-layout",
    url: req.url,
    contacts,
    notification: req.flash("notification"),
  });
});

// post form tambah data contact
app.post(
  "/contact",
  [
    body("name").custom(async (value) => {
      const duplikat = await Contact.findOne({ name: value });
      if (duplikat) {
        throw new Error("Nama sudah ada");
      }
      return true;
    }),
    check("nohp")
      .isMobilePhone("id-ID")
      .withMessage("Nomor hp yang anda masukkan tidak valid."),
    check("email")
      .isEmail()
      .withMessage("Email yang anda masukkan tidak valid."),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("add-contact", {
        title: "Page Add Contact",
        url: req.url,
        layout: "layouts/main-layout",
        errors: errors.array(),
      });
    } else {
      await Contact.insertMany(req.body);
      req.flash("notification", "Data berhasil ditambkan");
      res.redirect("/contact");
    }
  }
);

// method delete contact
app.delete("/contact", async (req, res) => {
  await Contact.deleteOne({ _id: req.body.id });
  req.flash("notification", "Data berhasil dihapus");
  res.redirect("/contact");
});

//  method update
app.put(
  "/contact",
  [
    check("nohp")
      .isMobilePhone("id-ID")
      .withMessage("No hp yang anda masukkan tidak valid."),
    check("email")
      .isEmail()
      .withMessage("Email yang anda masukkan tidak valid"),
    body("name").custom(async (value, { req }) => {
      const duplikat = await Contact.findOne({ name: value });
      //  jika nama diubah dan nama yang baru sudah ada di db maka akan return/throw pesan error
      if (req.body.oldName != value && duplikat?.name === value) {
        throw new Error("Nama sudah ada dalam contact.Gunakan nama yang lain");
      }
      return true;
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.render("update-contact", {
        title: "Update Contact Page",
        url: req.url,
        layout: "layouts/main-layout",
        errors: errors.array(),
        contact: req.body,
      });
    } else {
      // Jika data tidak berubah
      const { _id } = req.body;
      const contact = await Contact.findOne({ _id: _id });
      if (
        contact?.name === req.body.name &&
        contact?.email === req.body.email &&
        contact?.nohp === req.body.nohp
      ) {
        res.redirect("/contact");
      } else {
        await Contact.updateOne(
          {
            _id: _id,
          },
          {
            $set: {
              name: req.body.name,
              email: req.body.email,
              nohp: req.body.nohp,
            },
          }
        );
        req.flash("notification", "Data berhasil diupdate");
        res.redirect("/contact");
      }
    }
  }
);

app.get("/contact/update/:id", async (req, res) => {
  const contact = await Contact.findOne({ _id: req.params.id });
  res.render("update-contact", {
    title: "Page Update Contact",
    url: req.url,
    layout: "layouts/main-layout",
    contact,
  });
});

// halaman tambah contact
app.get("/contact/add", (req, res) => {
  res.render("add-contact", {
    title: "Add Contact Page",
    url: req.url,
    layout: "layouts/main-layout",
  });
});

// halaman detail contact
app.get("/contact/:id", async (req, res) => {
  // ngequery ke mongo untuk mengambil contact berdarkan id
  const contact = await Contact.findOne({ _id: req.params.id });

  res.render("detail-contact", {
    layout: "layouts/main-layout",
    url: req.url,
    title: "Detail Contact Page",
    contact,
  });
});

// halaman cli
app.get("/cli", (req, res) => {
  res.render("cli", {
    title: "Page CLI Contact",
    url: req.url,
    layout: "layouts/main-layout",
  });
});

// home not found
app.use((req, res) => {
  res.status(404);
  res.render("not-found", {
    title: "Not-found Page",
    url: req.url,
    layout: "layouts/main-layout",
  });
});
app.listen(port, () => {
  console.log(`listening in port ${port}`);
});
