const SC = require("./lib/design-tokens");
const rm = require("rimraf");
const fs = require("fs");

describe("GoA Design Tokens", () => {
  beforeEach((next) => {
    rm("./tmp", next);
    console.log = () => { }; // one of the libs has some console.log statements
  });

  it("should create css and scss files", async () => {
    SC.generate("./tmp");

    const cssfiles = fs.readdirSync("./tmp/dist").sort();
    expect(cssfiles.length).toBe(3);
    expect(cssfiles).toEqual([
      "experimental-tokens.css",
      "tokens.css",
      "tokens.scss",
    ]);
  });

  it("should create valid css output", async () => {
    SC.generate("./tmp");
    const raw = fs.readFileSync("./tmp/dist/tokens.css", { encoding: "utf8" });
    expect(raw).not.toContain("[object Object]");
  });

  it("should create valid experimental css output", async () => {
    SC.generate("./tmp");
    const raw = fs.readFileSync("./tmp/dist/experimental-tokens.css", { encoding: "utf8" });
    expect(raw).not.toContain("[object Object]");
    expect(raw).toContain(".v2-experimental-tokens");
  });
  it("should create valid scss output", async () => {
    SC.generate("./tmp");
    const raw = fs.readFileSync("./tmp/dist/tokens.scss", { encoding: "utf8" });
    expect(raw).not.toContain("[object Object]");
  });
});
