const NodeGit = require("../lib/nodegit");
const frontmatter = require("frontmatter");

module.exports = async (repo, branch, data) => {
  var path = require("path");

  // Open a repository that needs to be fetched and fast-forwarded
  return NodeGit.Repository.open(repo)
    .then(function (repository) {
      return repository.getBranch("refs/remotes/origin/main");
    })
    .then(function (reference) {
      console.log("Fetched " + reference.name());
      console.log("and the commit that it currently points to is ");

      return repository.getBranchCommit(reference.shorthand());
    })
    .then(function (commit) {
      console.log(commit.sha());

      // Get the remote
      return repository.getRemote("origin");
    })
    .then(function (remoteResult) {
      console.log("Progress:");

      remote = remoteResult;

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

      return remote.fetch(null, fetchOptions);
    })
    .then(function () {
      // Now that we're finished fetching, go ahead and merge our local branch
      // with the new one
      return repository.mergeBranches("master", "origin/master");
    })
    .catch(function (reason) {
      console.log(reason);
    })
    .done(function () {
      console.log("Done!");
    });
};
