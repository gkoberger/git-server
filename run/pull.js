const NodeGit = require("../lib/nodegit");
const frontmatter = require("frontmatter");

module.exports = async (repo, branch, data) => {
  var path = require("path");

  // Open a repository that needs to be fetched and fast-forwarded
  const repository = await NodeGit.Repository.open(repo);
  const reference = await repository.getBranch("refs/remotes/origin/main");
  console.log("Fetched " + reference.name());
  console.log("and the commit that it currently points to is ");
  const commit = await repository.getBranchCommit(reference.shorthand());
  console.log(commit.sha());

  const remoteResult = await repository.getRemote("origin");
  console.log("Progress:");

  let remote = remoteResult;

  // Create a fetch options object to get
  // the fetch progress.
  var fetchOptions = {
    callbacks: {
      credentials: function (url, userName) {
        return NodeGit.Cred.sshKeyFromAgent(userName);
      },
      certificateCheck: function () {
        return 1;
      },
      transferProgress: function (data) {
        console.log(
          "(" + data.receivedObjects() + "/" + data.totalObjects() + ")"
        );
      },
    },
  };

  await remote.fetch(null, fetchOptions);
  await repository.mergeBranches("main", "origin/main");
  console.log("Done!");
};
