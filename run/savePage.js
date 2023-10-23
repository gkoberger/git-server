const NodeGit = require("../lib/nodegit");
const frontmatter = require('gray-matter');

module.exports = async (repo, branch, data) => {
  const repository = await NodeGit.Repository.openBare(repo);

  const refName = `refs/heads/${branch || "main"}`;

  const ref = await NodeGit.Reference.nameToId(repository, refName);
  const commit = await repository.getCommit(ref);

  let tree = await commit.getTree();

  const filePath = `guides/${data.category}/${data.page}`;

  // Update or modify the tree contents
  const treeEntry = tree.entryByPath(filePath);

  // Create a new blob with the updated content
  const newBlobId = await repository.createBlobFromBuffer(
    Buffer.from(frontmatter.stringify(data.content, data.data))
  );

  // Update the tree entry with the new blob id
  treeEntry.id = newBlobId;

  var author = NodeGit.Signature.create(
    "Greg",
    "gkoberger@gmail.com",
    123456789,
    60
  );
  var committer = NodeGit.Signature.create(
    "Greg",
    "gkoberger@gmail.com",
    987654321,
    90
  );

  // Break down path into directory parts
  //
  const pathParts = filePath.split("/");

  // The filename is the last component of the path
  let filename = pathParts.pop();

  // Recursive function to handle each level of the path
  const processTreeEntry = async (pathParts, tree) => {
    if (pathParts.length === 0) {
      let builder = await NodeGit.Treebuilder.create(repository, tree);
      builder.insert(filename, newBlobId, NodeGit.TreeEntry.FILEMODE.BLOB);
      return builder.write();
    } else {
      let part = pathParts.shift();
      let entry;
      try {
        entry = await tree.entryByName(part); // Will throw if 'part' doesn't exist
      } catch (err) {
        const builder = await NodeGit.Treebuilder.create(repository, tree);
        const newTreeOid = await builder.write();
        entry = builder.insert(
          part,
          newTreeOid,
          NodeGit.TreeEntry.FILEMODE.TREE
        );
      }
      const subTree = await repository.getTree(entry.oid());
      const newOid = await processTreeEntry(pathParts, subTree);
      const builder = await NodeGit.Treebuilder.create(repository, tree);
      builder.insert(part, newOid, NodeGit.TreeEntry.FILEMODE.TREE);
      return builder.write();
    }
  };

  // Create the new tree
  const newTreeOid = await processTreeEntry(pathParts, tree);
  const newTree = await repository.getTree(newTreeOid);

  // Create a new commit
  const newCommitId = await repository.createCommit(
    `refs/heads/${branch}`,
    author,
    committer,
    "Updated file",
    newTree,
    [commit]
  );

  require('./deploy')(repo, branch);
  return true;
};
