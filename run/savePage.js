// https://docs.gitlab.com/ee/api/repository_files.html#update-existing-file-in-repository
const frontmatter = require('gray-matter');

module.exports = async (repo, branch, data) => {
  const filePath = `guides/${data.category}/${data.page}`;

  const page = await fetch(`http://159.223.168.222/api/v4/projects/${encodeURIComponent(repo)}/repository/files/${encodeURIComponent(filePath)}?ref=${branch}`, {
    method: 'PUT',
    headers: {
      "PRIVATE-TOKEN": process.env.GITLAB_PRIVATE_TOKEN,
      'content-type': "application/json",
    },
    body: JSON.stringify({
      branch,
      author_name: 'Dom Harrington',
      author_email: 'dom@readme.io',
      commit_message: 'Updated file',
      content: frontmatter.stringify(data.content, data.data),
    })
  }).then(res => res.json());

  // require('./deploy')(repo, branch);
  return true;
};
