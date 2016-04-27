var crypto = require('crypto');
var User = require('../models/user.js');
var express = require('express');

var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('index', { 
	title: '主页',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
  });
});

router.get('/reg', function(req, res) {
  res.render('reg', { 
        title: '注册',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
   });
});

router.post('/reg', function(req, res, next) {
    var name = req.body.name,
        password = req.body.password,
        password_re = req.body["password-repeat"];

    if (password_re != password) {
        req.flash('error', '两次输入的密码不一样');
        return res.redirect('/reg');
    }

    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    var newUser = new User({
        name: name,
	password: password,
        email: req.body.email
    });

    User.get(newUser.name, function(err, user) {
        if (err) {
             req.flash('error', err);
             return res.redirect('/');
        }

        if (user) {
            req.flash('error', '用户已经存在');
            return res.redirect('/reg');
        }
   
        newUser.save(function(err, user) {
            if (err) {
                req.flash('error', err);
                return res.redirect('/reg');
            }

            req.session.user = newUser;
            req.flash('success', '注册成功');
            res.redirect('/');
        });
    });
});

router.get('/login', function(req, res) {
  res.render('login', { 
        title: '登录',
        user: req.session.user,
        success: req.flash('success').toString(),
        error: req.flash('error').toString()
    });
});

router.post('/login', function(req, res) {
    var md5 = crypto.createHash('md5'),
        password = md5.update(req.body.password).digest('hex');
    
    User.get(req.body.name, function(err, user) {
        if (!user) {
            req.flash('error', '用户不存在');
            return res.redirect('/login');
        }
        if (user.password != password) {
            req.flash('error', '密码错误');
            return res.redirect('/login');
        }

        req.session.user = user;
        req.flash('success', '登录成功');
        res.redirect('/');
    });
});


router.get('/post', function(req, res) {
  res.render('post', { title: '发表' });
});

router.post('/post', function(req, res) {
});

router.get('/logout', function(req, res) {
    req.session.user = null;
    req.flash('success', "登出成功");
    res.redirect('/')
});


module.exports = router;
