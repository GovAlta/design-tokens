const StyleDictionary = require("style-dictionary");

function generate(outputPath) {
  // Typography
  StyleDictionary.registerTransform({
    name: "typography/shorthand",
    type: "value",
    transitive: true,
    matcher: function (token) {
      return token.type === "typography";
    },
    transformer: function (token) {
      const { fontWeight, fontSize, lineHeight, fontFamily } =
        token.original.value;
      return `${fontWeight} ${fontSize}/${lineHeight} ${fontFamily}`;
    },
  });

  // Drop Shadow
  StyleDictionary.registerTransform({
    name: "box-shadow",
    type: "value",
    transitive: true,
    matcher: function (token) {
      return token.type === "boxShadow";
    },
    transformer: function (token) {
      const { x, y, blur, spread, color } = token.original.value;
      return `${x}px ${y}px ${blur}px ${spread}px ${color}`;
    },
  });

  // Border
  StyleDictionary.registerTransform({
    name: "border",
    type: "value",
    transitive: true,
    matcher: function (token) {
      return token.type === "border";
    },
    transformer: function (token) {
      const { color, width, style } = token.original.value;
      return `${width} ${style} ${color}`;
    },
  });

  // Font Variation Settings
  StyleDictionary.registerTransform({
    name: "fontVariationSettings",
    type: "value",
    transitive: true,
    matcher: function (token) {
      return token.type === "fontVariationSettings";
    },
    transformer: function (token) {
      const settings = token.original.value;
      return Object.entries(settings)
        .map(([key, value]) => `${key} ${value}`)
        .join(", ");
    },
  });

  try {
    StyleDictionary.extend({
      source: [`./data/**/*.json`],
      platforms: {
        scss: {
          prefix: "goa",
          transforms: [
            ...StyleDictionary.transformGroup.scss,
            "typography/shorthand",
            "box-shadow",
            "border",
            "fontVariationSettings",
          ],
          buildPath: `${outputPath}/dist/`,
          files: [
            {
              destination: "tokens.scss",
              format: "scss/variables",
            },
          ],
        },
        css: {
          prefix: "goa",
          transforms: [
            ...StyleDictionary.transformGroup.css,
            "typography/shorthand",
            "box-shadow",
            "border",
            "fontVariationSettings",
          ],
          buildPath: `${outputPath}/dist/`,
          files: [
            {
              destination: "tokens.css",
              format: "css/variables",
              options: {
                outputReferences: true,
              },
            },
          ],
        },
      },
    }).buildAllPlatforms();
  } catch (e) {
    console.error("ERROR", e.message);
  }
}

module.exports = {
  generate: generate,
};
