const StyleDictionary = require("style-dictionary");
const fs = require("fs");

function generate(outputPath) {
  // Register custom format for CSS with dark mode
  StyleDictionary.registerFormat({
    name: "css/variables-with-dark-mode",
    formatter: function ({ dictionary, options, file }) {
      const { outputReferences } = options;
      
      // Helper function to get value with reference support
      const getValue = (token) => {
        if (outputReferences && token.original.value && typeof token.original.value === 'string' && token.original.value.startsWith('{')) {
          // Convert token reference to CSS variable reference
          const ref = token.original.value.replace(/\{|\}/g, '').replace(/\./g, '-');
          return `var(--${options.prefix || 'goa'}-${ref})`;
        }
        return token.value;
      };
      
      // Build light mode variables
      const lightVars = dictionary.allTokens
        .map((token) => `  --${token.name}: ${getValue(token)};`)
        .join('\n');
      
      // Read dark mode tokens
      let darkVars = '';
      try {
        const darkTokensPath = './data/goa-global-design-tokens-dark.json';
        if (fs.existsSync(darkTokensPath)) {
          const darkTokensData = JSON.parse(fs.readFileSync(darkTokensPath, 'utf8'));
          const darkTokens = [];
          
          // Recursively collect all tokens from the dark mode JSON
          const collectTokens = (obj, path = []) => {
            for (const key in obj) {
              if (obj[key].value !== undefined) {
                const tokenPath = [...path, key].join('-');
                const fullName = `${options.prefix || 'goa'}-${tokenPath}`;
                
                let value = obj[key].value;
                // Handle references in dark mode
                if (typeof value === 'string' && value.startsWith('{')) {
                  const ref = value.replace(/\{|\}/g, '').replace(/\./g, '-');
                  value = `var(--${options.prefix || 'goa'}-${ref})`;
                }
                
                darkTokens.push({ name: fullName, value });
              } else if (typeof obj[key] === 'object') {
                collectTokens(obj[key], [...path, key]);
              }
            }
          };
          
          collectTokens(darkTokensData);
          
          darkVars = darkTokens
            .map((token) => `    --${token.name}: ${token.value};`)
            .join('\n');
        }
      } catch (e) {
        console.error('Error loading dark mode tokens:', e.message);
      }
      
      // Build output with dark mode media query
      let output = `/**\n * Do not edit directly\n * Generated on ${new Date().toUTCString()}\n */\n\n`;
      output += `:root {\n${lightVars}\n}\n`;
      
      if (darkVars) {
        output += `\n@media (prefers-color-scheme: dark) {\n  :root {\n${darkVars}\n  }\n}\n`;
      }
      
      return output;
    },
  });

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
      const toPx = (value) => {
        if (value === 0 || value === "0") return "0px";
        if (typeof value === "number") return `${value}px`;
        if (typeof value !== "string") return value;
        if (/^-?\d+(\.\d+)?$/.test(value)) return `${value}px`;
        return value;
      };

      const formatLayer = (layer) => {
        const { x, y, blur, spread, color } = layer;
        return `${toPx(x)} ${toPx(y)} ${toPx(blur)} ${toPx(spread)} ${color}`;
      };

      const value = token.original.value;
      if (Array.isArray(value)) {
        return value.map(formatLayer).join(", ");
      }

      return formatLayer(value);
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
    // Build light mode tokens from main source
    // Note: Dark mode tokens are excluded here and loaded separately by the custom formatter
    // to prevent collision warnings during the build process
    StyleDictionary.extend({
      source: [`./data/goa-global-design-tokens.json`, `./data/component-design-tokens/**/*.json`],
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
              format: "css/variables-with-dark-mode",
              options: {
                outputReferences: true,
                prefix: "goa",
                transforms: [
                  ...StyleDictionary.transformGroup.css,
                  "typography/shorthand",
                  "box-shadow",
                  "border",
                  "fontVariationSettings",
                ],
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
