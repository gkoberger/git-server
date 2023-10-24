// https://docs.gitlab.com/ee/api/repositories.html#list-repository-tree
// curl --header "PRIVATE-TOKEN: xxx" "http://159.223.168.222/api/v4/projects/root%2Ftest-docs/repository/tree?recursive=true" | jq

module.exports = async (repo, branch, data) => {
  const sidebar = await fetch(`http://159.223.168.222/api/v4/projects/${encodeURIComponent(repo)}/repository/tree?recursive=true`, {
    headers: {
      "PRIVATE-TOKEN": process.env.GITLAB_PRIVATE_TOKEN
    }
  }).then(res => res.json());

  const tree = {}

  for (let index = 0; index < sidebar.length; index++) {
    const element = sidebar[index];
    const path = element.path.split('/');
    path.forEach((section, i) => {
      if (i === 0) {
        if (!tree[section]) tree[section] = {}
      }

      if (i === 1) {
        if (!tree[path[0]][section]) tree[path[0]][section] = []
      }

      if (i === 2) {
        tree[path[0]][path[1]].push(section)
      }
    })
  }

  return tree;
};
