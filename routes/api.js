//http://stackoverflow.com/questions/13412579/node-express-mongoose-sub-collection-document-insert

var uval = require('../myutils/uvalidation.js'),
  ucrypto = require('../myutils/ucrypto.js'),
  User = require('../models/user.js'),
  navbar = require('./navbar.js');

exports.home = function(req, res) {
  res.redirect('/login');
};

// exports.dashboard = function(req, res) {
//   if (req.session.user) {
//     res.send('<h2>' + req.session.msg + '</h2>' +
//       '<p>You have entered the restricted section</p></br>' +
//       '<a href="/logout">Logout</a>'
//     );
//   } else {
//     req.session.error = 'Please log in.';
//     res.redirect('/login');
//   }
// };

exports.dashboard = function(req, res) {
  if (req.session.user) {
    res.render('dashboard', {
      name: req.session.user.name,
      menu: navbar()
    });
  } else {
    req.session.error = 'Please log in.';
    res.redirect('/login');
  }
};

exports.consumption = function(req, res) {
  if (req.session.user) {
    res.render('consumption', {
      name: req.session.user.name,
      menu: navbar('Consumption')
    });
  } else {
    req.session.error = 'Please log in.';
    res.redirect('/login');
  }
};

exports.logout = function(req, res) {
  req.session.destroy(function(err) {
    res.redirect('/login');
  });
};

exports.loginGet = function(req, res) {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render("login", {
    ses:req.session
  });
};

exports.loginPost = function(req, res) {
  var email = req.body.email,
    pwd = req.body.password;

  function logonFail() {
    req.session.error = "Invalid email or password";
    res.redirect('/login');
  }

  User.findOne({email: email}, function(err, user) {
    if (err) return next(err);
    if (!user) return logonFail();
    ucrypto.compareBcrypt(pwd, user.password, function(err, result) {
      if (err) return next(err);
      if (result) {
        req.session.user = {};
        req.session.user.name = user.name;
        req.session.user.email = email;
        req.session.msg = "Authenticated as " + user.name;
        req.session.error = null;
        res.redirect('/dashboard');
      } else {
        logonFail();
      }
    });
  });
};

exports.registerGet = function(req, res) {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  res.render('register', {ses: req.session});
};

exports.registerPost = function(req, res, next) {
  var email = req.body.email,
  pwd = req.body.password,
  name = req.body.name;

  // TODO email regex validation
    // TODO verification by email
    if (!uval.validateEmail(email)) {
      req.session.regError = 'Incorrect Email format.';
      return res.redirect('/register');
    }
  if (!email || !pwd) {
    req.session.regError = 'Email and Password are required.';
      return res.redirect('/register');
  }

  new User({name: name, email: email, password: pwd})
      .save(function(err, doc) {
        if (err) {
          if (err.code === 11000) {
            req.session.regError = 'User with email ' + email +
              ' already exists.';
            return res.redirect('/register');
          }
          return next(err);
        }
        req.session.msg = "Successfully registered, please log in.";
        res.redirect('/login');
      }
    );
};

exports.clearMessages = function(req, res) {
  req.session.msg = null;
  req.session.regError = null;
  req.session.error = null;
};

// exports.loginGet = function(req, res) {
//     var response = '<form method="POST">' +
//         'email: <input type="text" name="email"></br>' +
//         'password: <input type="password" name="password"></br>' +
//         '<input type="submit" value="Submit"></form>' +
//         '<p>or <a href="/register">register here</a>.</p>';
//     if (req.session.user) {
//         res.redirect('/dashboard');
//     } else if (req.session.error) {
//         response += '<h2>' + req.session.error + '</h2>';
//     }
//     if (req.session.msg) {
//         response += '<h3>' + req.session.msg + '</h3>';
//     }
//     res.type('html');
//     res.send(response);
// };

// exports.registerGet = function(req, res) {
//     // TODO captcha
//  var response = '<form method="POST">' +
//         'name: <input type="text" name="name"></br>' +
//         'email *: <input type="text" name="email"></br>' +
//         'password *: <input type="password" name="password"></br>' +
//         '<input type="submit" value="Register"></form>';
//     if (req.session.user) {
//         res.redirect('/dashboard');
//     } else if (req.session.regError) {
//         response += '<h2>' + req.session.regError + '</h2>';
//     }
//     res.type('html');
//     res.send(response);
// };