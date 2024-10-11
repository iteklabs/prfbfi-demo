const express = require('express');
const jwt = require('jsonwebtoken');


const auth = async(req, res, next) => {
    try{
        const token = req.cookies.jwt
        // console.log("middleware token", token);
        
        if(!token){
            req.flash("errors", "You Are Not Authorized, Please Login First ...")
            return res.redirect("/")
        }

        const decode = await jwt.verify(token, process.env.secret_key)
        
        req.user = decode
            
        next();
    }catch(error){

        // console.log("auth",error);
        req.flash("errors", "You Are Not Authorized, Please Login First ...")
        return res.redirect("/")
    }
}

module.exports = auth