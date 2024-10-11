const express = require("express");
const app = express();
const router = express.Router();
const bcrypt = require('bcryptjs');
const {sing_up, staff, profile, master_shop, email_settings} = require("../models/all_models");
const auth = require("../middleware/auth");
const nodemailer = require('nodemailer');


router.get("/view", async (req, res) => {
    const master = await master_shop.find()

    res.render("email_reset", {
        success: req.flash('success'),
        errors: req.flash('errors'),
        master_shop : master,
    })
});


function generateRandomAlphanumericString(length = 6) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters[randomIndex];
    }
    return result;
  }
  

router.post("/view", async (req, res) => {
    const { email } = req.body
    const profile_data = await sing_up.findOne({ email : email})
    var Code_data = generateRandomAlphanumericString();
    const hash = await bcrypt.hash(Code_data, 10);
    if(profile_data){

        profile_data.code = Code_data;
        profile_data.isUsed = "False";
        const dataSaved = profile_data.save();



        const master = await master_shop.find()
        const email_data = await email_settings.findOne()

        let mailTransporter = nodemailer.createTransport({
            host: email_data.host,
            port: Number(email_data.port),
            secure: false,
            auth: {
                user: email_data.email,
                pass: email_data.password
            }
        });


        let mailDetails = {
            from: email_data.email,
            to: profile_data.email,
            subject:'Password Reset - ' + master[0].site_title ,
            attachments: [{
                filename: 'Logo.png',
                path: __dirname + '/../public' +'/upload/'+master[0].image,
                cid: 'logo'
           }],
            html:'<!DOCTYPE html>'+
                '<html><head><title></title>'+
                '</head><body>'+
                    '<div>'+
                        '<div style="display: flex; align-items: center; justify-content: center;">'+
                            '<div>'+
                                '<img src="cid:logo" class="rounded" width="66.5px" height="66.5px"></img>'+
                            '</div>'+
                        
                            // '<div>'+
                            //     '<h2> '+ master[0].site_title +' </h2>'+
                            // '</div>'+
                        '</div>'+
                        
                        '<div>'+
                         '<p>Hello, <br> We have sent you this email in response to your request to reset please copy this code <h1><b>'+Code_data+'</b></h1></p>'+
                        '</div>'+

                        '<hr class="my-3">'+
                        '<div>'+
                            '<strong> Regards </strong>'+
                            '<h5>'+ master[0].site_title +'</h5>'+
                        '</div>'+
                    '</div>'+
                '</body></html>'
        };

        mailTransporter.sendMail(mailDetails, function(err, data) {
            if(err) {
                console.log(err);
                console.log('Error Occurs');
            } else {
                console.log('Email sent successfully');
            }
        });


        res.redirect("/forgotPassword/code/")
    }else{
        req.flash("error", `Email Not Found please check your email`)
        res.redirect("/forgotPassword/view")
    }

});

router.get("/code/", async (req, res) => {
    const master = await master_shop.find()
    res.render("email_code", {
        success: req.flash('success'),
        errors: req.flash('errors'),
        master_shop : master,
    })
})


router.post("/code/", async (req, res) => {
    const { code } = req.body
    const profile_data = await sing_up.find({ code : code})
    console.log(profile_data.length)
    res.json(profile_data)
})



router.post("/code_password/", async (req, res) => {

    const { codex, password, cpassword, email } = req.body
    const profile_data = await sing_up.findOne({ code : codex, email: email, isUsed: "False"})
    const hash = await bcrypt.hash(password, 10);
  

    if(profile_data){

        profile_data.password = hash;
        profile_data.isUsed = "True";
        const dataSaved = profile_data.save();



        const master = await master_shop.find()
        const email_data = await email_settings.findOne()

        let mailTransporter = nodemailer.createTransport({
            host: email_data.host,
            port: Number(email_data.port),
            secure: false,
            auth: {
                user: email_data.email,
                pass: email_data.password
            }
        });


        let mailDetails = {
            from: email_data.email,
            to: profile_data.email,
            subject:'Password Successfuly Reset - ' + master[0].site_title ,
            attachments: [{
                filename: 'Logo.png',
                path: __dirname + '/../public' +'/upload/'+master[0].image,
                cid: 'logo'
           }],
            html:'<!DOCTYPE html>'+
                '<html><head><title></title>'+
                '</head><body>'+
                    '<div>'+
                        '<div style="display: flex; align-items: center; justify-content: center;">'+
                            '<div>'+
                                '<img src="cid:logo" class="rounded" width="66.5px" height="66.5px"></img>'+
                            '</div>'+

                        '</div>'+
                        
                        '<div>'+
                         '<p>Hello '+profile_data.name+', <br>Your password has been successfully reset. You can now log in with your new password.</p>'+
                        '</div>'+

                        '<hr class="my-3">'+
                        '<div>'+
                            '<strong> Regards </strong>'+
                            '<h5>'+ master[0].site_title +'</h5>'+
                        '</div>'+
                    '</div>'+
                '</body></html>'
        };

        mailTransporter.sendMail(mailDetails, function(err, data) {
            if(err) {
                console.log(err);
                console.log('Error Occurs');
            } else {
                console.log('Email sent successfully');
            }
        });


        res.redirect("/login/")
    }else{
        req.flash("error", `Email Not Found please check your email`)
        res.redirect("/forgotPassword/code")
    }



    // res.json(profile_data)
})



module.exports = router;
