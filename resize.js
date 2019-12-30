const fs = require("fs");
const rimraf = require("rimraf");
const sharp = require("sharp");
const minify = require("html-minifier").minify;
const base = "./img";
const template = "index.template.html";
const sizes = [420, 840];
let processed_count = 0;
let images_html = "";

fs.readdir(`${base}/full`, (err, files) => {
  if (err) {
    console.log;
    `Couldn't read image files. ${err}`;
  } else {
    const total_files = files.length;
    files.forEach(file => {
      file = file.replace(".jpg", "");
      let prev_size = 0;
      let sources_html = "";

      sizes.forEach(size => {
        rimraf(`${base}/${size}/*`, () => {
          resize(file, size);
        });

        prev_size++;

        sources_html += `
          <source
            type="image/webp"
            media="(min-width: ${prev_size})"
            srcset="img/${size}/${file}.webp">                      
          <source
            type="image/jpeg"
            media="(min-width: ${prev_size})"
            srcset="img/${size}/${file}.jpg">                      
        `;

        prev_size = size;
      });

      // Output HTML for files
      images_html += `<a
                    href="img/full/${file}.jpg"
                    target="_blank">
                    <picture>
                      ${sources_html}
                      <img src="img/${sizes[sizes.length - 1]}/${file}.jpg">
                    </picture>
                  </a>`;

      processed_count++;

      if (processed_count === total_files) {
        save_processed_files();
      }
    });
  }
});

const resize = (file, width) => {
  // WebP version
  sharp(`${base}/full/${file}.jpg`)
    .resize(width)
    .toFormat("webp")
    .toFile(`./img/${width}/${file}.webp`, (err, info) => {
      if (err) {
        console.log(`Uh oh! Couldn't save output file. ${err}`);
      }
    });

  // JPG backup
  sharp(`${base}/full/${file}.jpg`)
    .resize(width)
    .toFormat("jpg")
    .toFile(`./img/${width}/${file}.jpg`, (err, info) => {
      if (err) {
        console.log(`Uh oh! Couldn't save output file. ${err}`);
      }
    });
};

const save_processed_files = () => {
  fs.readFile(template, "utf-8", (err, data) => {
    if (err) {
      console.log(`Couldn't read ${template}. ${err}`);
    } else {
      const html = data.replace("{{the_content}}", images_html);
      const minified = minify(html, {
        minifyCSS: true,
        html5: true,
        collapseWhitespace: true,
        collapseInlineTagWhitespace: true,
        decodeEntities: true,
        includeAutoGeneratedTags: true,
        removeComments: true
      });
      fs.writeFile("./index.html", minified, written_files);
    }
  });
};

const written_files = () => {
  console.log(`Saved index.html`);
};