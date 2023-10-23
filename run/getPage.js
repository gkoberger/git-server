const NodeGit = require("../lib/nodegit");
const frontmatter = require("frontmatter");

module.exports = async (repo, branch, data) => {
  const repository = await NodeGit.Repository.openBare(repo);

  const refName = `refs/heads/${branch || "main"}`;

  const ref = await NodeGit.Reference.nameToId(repository, refName);
  const commit = await repository.getCommit(ref);

  const tree = await commit.getTree();

  const filePath = `guides/${data.category}/${data.page}`;

  const entry = await tree.getEntry(filePath);
  const blob = await entry.getBlob();

  const parsed = frontmatter(blob.toString());
  parsed.content = parsed.content.trim();

  parsed.meta = data;
  return parsed;
};
