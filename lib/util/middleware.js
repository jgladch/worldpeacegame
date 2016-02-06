class Middleware {
  constructor(filemanager) {
    this.filemanager = filemanager;
  }

  fetchDymaxFile() {
    let self = this;
    return (req, res, next) => {
      return self.filemanager.fetchDymaxFile(req.filename).then((json) => {
        req.json = json;
        next();
      }).catch((err) => {
        console.log('Error: ', err);
        next(err);
      });
    };
  }
}

exports.Middleware = Middleware;