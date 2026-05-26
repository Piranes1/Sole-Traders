// Logic to protect the profile route from not logged in users who could type in route
exports.isAuth = (req, res, next) => {

  const { isLoggedIn } = req.session;
  if (!isLoggedIn) {
    return res.redirect("/login");
  }
  next();
};