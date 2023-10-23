const NodeGit = require("../lib/nodegit");
const frontmatter = require("frontmatter");

module.exports = async (repo, branch, data) => {
  const repository = await NodeGit.Repository.open(repo);
  let remote;
  try {
    remote = await repository.getRemote("origin");
  } catch (e) {
    return;
  }

  try {
    await remote.pull([`refs/heads/${branch}:refs/heads/${branch}`], {
      callbacks: {
        credentials: function (url, userName) {
          return NodeGit.Cred.sshKeyFromAgent(userName);
        },
      },
    });
  } catch (e) {
    console.log(e);
  }

  return;
};
