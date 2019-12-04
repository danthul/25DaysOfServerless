module.exports = async function(context, req) {
  context.log("JavaScript HTTP trigger function processed a request.");
  let imagesFound = [];
  if (req.body) {
    const url = req.body.repository.url;
    if (req.body.commits.length > 0) {
      const commits = req.body.commits;
      commits.map(commit => {
        if (commit.added.length > 0) {
          commit.added.map(add => {
            if (add.endsWith(".png")) {
              //we have a png, let's go
              imagesFound.push(add);
              context.bindings.animalImage = JSON.stringify({
                url: `${url}/tree/master/images/${add}`
              });
            }
          });
        }
        if (commit.modified.length > 0) {
          commit.modified.map(modified => {
            if (modified.endsWith(".png")) {
              //we have a png, let's go
              imagesFound.push(modified);
              context.bindings.animalImage = JSON.stringify({
                url: `${url}/tree/master/images/${modified}`
              });
            }
          });
        }
      });
    }
    context.res = {
      // status: 200, /* Defaults to 200 */
      body: `Found ${imagesFound.length} images`
    };
  } else {
    context.res = {
      status: 400,
      body: "Something went wrong"
    };
  }
};
