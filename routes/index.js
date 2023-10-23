const express = require("express");
const router = express.Router();
const fs = require("fs");
const { execSync } = require("child_process");
var YAML = require("yaml");
var frontmatter = require("frontmatter");

router.get("/", (req, res) => {
  res.json({ success: true });
});

/* Expects:
 * {
 *   repo: ...
 *   branch: ...
 *   script: ...
 *   data: ...
 * }
 */

router.post("/run", async (req, res, next) => {
  const repo = `../repositories/${req.body.repo}`;
  const script = require(`../run/${req.body.script}`);
  const out = await script(repo, req.body.branch, req.body.data);
  res.json(out);
});

router.post("/deploy/:repo", async (req, res, next) => {
  const repo = `../repositories/${req.params.repo}`;
  const script = require(`../run/deploy`);
  const out = await script(repo, 'main');
  res.json(out);
});

/*
router.post("/:repo/init", (req, res, next) => {
  const repo = `../../repos/${req.params.repo}`;
  const exec = _exec(repo);

  // Make sure there's a repos folder
  // (aka for the first time on a server)
  // This is only for the prototype
  createFolder("../../repos");

  // Create a folder
  createFolder(repo);

  // Set up git in it
  exec("git init");

  res.json({ success: true });
});

router.post("/:repo/save", (req, res, next) => {
  const repo = `../../repos/${req.params.repo}`;
  const exec = _exec(repo);

  const slug = req.body.slug;
  const meta = req.body.meta;
  const content = req.body.content;

  // TODO: redo the frontmatter

  fs.writeFileSync(
    `${repo}/docs/${slug}.md`,
    createFrontmatter(meta, content),
    { flag: "w" }
  );

  res.json({ success: true });
});

router.post("/:repo/load", (req, res, next) => {
  // This is bad, because it... loads everything! We wouldn't
  // want to do this ultimately. That being said, at this point
  // in the prototype, this felt the easiest.

  const repo = `../../repos/${req.params.repo}`;
  const exec = _exec(repo);

  const slug = req.body.slug;
  const meta = req.body.meta;
  const content = req.body.content;

  // TODO: redo the frontmatter

  console.log(createFrontmatter(meta, content));

  fs.writeFileSync(
    `${repo}/docs/${slug}.md`,
    createFrontmatter(meta, content),
    { flag: "w" }
  );

  res.json({ success: true });
});

function createFolder(folder) {
  console.log("creating", folder);
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder);
  }
}

function _exec(cwd) {
  return function (command) {
    const output = execSync(command, { cwd });
    return output.toString();
  };
}

function createFrontmatter(meta, content) {
  const y = YAML.stringify(meta);
  return `${y}\n------------${content}`;
}
*/

module.exports = router;
