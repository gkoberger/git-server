// https://docs.gitlab.com/ee/api/repository_files.html#get-file-from-repository
// curl--header "PRIVATE-TOKEN: xxx" "http://159.223.168.222/api/v4/projects/root%2Ftest-docs/repository/files/guides%2FCategory%202%2Ftest-pg.md?ref=main"

const frontmatter = require("frontmatter");

module.exports = async (repo, branch, data) => {
  const filePath = `guides/${data.category}/${data.page}`;
  const page = await fetch(`http://159.223.168.222/api/v4/projects/${encodeURIComponent(repo)}/repository/files/${encodeURIComponent(filePath)}?ref=${branch}`, {
    headers: {
      "PRIVATE-TOKEN": process.env.GITLAB_PRIVATE_TOKEN
    }
  }).then(res => res.json());

  const content = new Buffer.from(page.content, 'base64').toString();
  const parsed = frontmatter(content);
  parsed.content = parsed.content.trim();

  parsed.meta = data;
  return parsed;
};
