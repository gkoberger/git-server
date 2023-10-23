const NodeGit = require("../lib/nodegit");

module.exports = async (repo, branch, data) => {
  async function listFilesInRepo() {
    const repository = await NodeGit.Repository.openBare(repo);
    //const headCommit = await repository.getHeadCommit();

    const references = await NodeGit.Reference.list(repository);
    console.log(references);

    const refName = `refs/heads/${branch || "main"}`;

    const ref = await NodeGit.Reference.nameToId(repository, refName);
    const commit = await repository.getCommit(ref);

    const tree = await commit.getTree();

    function convertToSidebar(array) {
      const result = {};

      array.forEach((path) => {
        const parts = path.split("/");
        let currentLevel = result;

        parts.forEach((part, index) => {
          // If we are at the penultimate part, make the last part an array in the object
          if (index === parts.length - 2) {
            if (!currentLevel[part]) {
              currentLevel[part] = [parts[index + 1]];
            } else {
              currentLevel[part].push(parts[index + 1]);
            }
          }

          // Else continue building the object
          else if (!currentLevel[part]) {
            if (part.match(/md/)) return;
            currentLevel[part] = {};
          }

          currentLevel = currentLevel[part];
        });
      });

      return result;
    }

    return new Promise((resolve, reject) => {
      const filePaths = [];
      const walker = tree.walk(true);
      walker.on("entry", (entry) => filePaths.push(entry.path()));
      walker.on("end", () => resolve(convertToSidebar(filePaths)));
      walker.on("error", reject);
      walker.start();
    });
  }

  try {
    const out = await listFilesInRepo();
    return out;
  } catch (e) {
    console.log(e);
  }
};
