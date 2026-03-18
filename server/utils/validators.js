exports.validateEmail = (email) =>
  /^\S+@\S+\.\S+$/.test(email);

exports.validatePassword = (password) =>
  password.length >= 6;