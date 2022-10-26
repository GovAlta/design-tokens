const StyleDictionary = require('style-dictionary');
const fs = require("fs")

function createDictionary(root, filename) {
  const name = filename.split(".")[0];
  return StyleDictionary.extend({
    source: [`./data/${filename}`],
    platforms: {
      scss: {
        transformGroup: "scss",
        buildPath: `${root}/scss/`, 
        files: [{
          destination: `${name}.scss`,
          format: "scss/variables"
        }]
      },
      css: {
        transformGroup: "css",
        buildPath: `${root}/css/`, 
        files: [{
          destination: `${name}.css`,
          format: "css/variables"
        }]
      }
    },
  })
}

function getFiles() {
  return fs.readdirSync("./data");
}

function generate(root) {
  try {
    const files = getFiles();
    for (const file of files) {
      console.log("some needless comment")
      const config = createDictionary(root, file);
      config.buildAllPlatforms();
    }
  } catch(e) {
    console.error("BIG ERROR", e.message);
  }
}

module.exports = {
  generate: generate
}
