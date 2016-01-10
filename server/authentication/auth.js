'use strict';
var userModel = require('../models/user');
var bcrypt = require('bcrypt-nodejs');
var jwt = require('jsonwebtoken');


var AuthCtrl = class {

  authenticate(req, res) {

    userModel.findOne({
      username: req.body.username
    }, function(err, user) {
      if (err) {
        res.status(500).send(err);
      } else {

        if (!user) {
          res.status(403).json({
            success: false,
            message: 'Authentication failed'
          });
        } else if (user) {

          if (!bcrypt.compareSync(req.body.password, user.password)) {
            res.status(403).json({
              success: false,
              message: 'Authentication failed'
            });
          } else {

            var token = jwt.sign(user, 'notSoSecret', {
              expiresIn: 86400
            });

            res.json({
              success: true,
              message: 'Authenticated',
              token: token
            });
          }

        }
      }

    });
  }
  authorise(req, res, next) {

    var token = req.body.token || req.params.token || req.headers['x-access-token'];
    if (token) {

      jwt.verify(token, 'notSoSecret', function(err, decoded) {
        if (err) {
          return res.status(403).json({
            success: false,
            message: 'Failed to authenticate token.'
          });
        } else {
          req.decoded = decoded;
          next();
        }
      });

    } else {

      return res.status(403).send({
        success: false,
        message: 'No token provided.'
      });

    }

  }
}

module.exports = new AuthCtrl();
