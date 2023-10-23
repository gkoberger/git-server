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
    await remote.push([`refs/heads/${branch}:refs/heads/${branch}`], {
      callbacks: {
        credentials: function (url, userName) {
          /*
                        return Git.Cred.sshKeyNew(
                            userName,
                            '/path/to/your/public/key.pub',     // Replace with your public key path
                            '/path/to/your/private/key',        // Replace with your private key path
                            'yourPassphrase'                    // Replace with your key's passphrase, or '' if no passphrase
                        );
          */
          return NodeGit.Cred.sshKeyFromAgent(userName);
        },
      },
    });
  } catch (e) {
    console.log(e);
  }

  async function addRemoteToBareRepo() {
    return; // dont need this rn!
    try {
      await NodeGit.Remote.create(
        repository,
        "origin",
        "https://github.com/gkoberger/test-docs.git"
      );
    } catch (err) {
      console.log(err);
    }
  }

  return;
};
