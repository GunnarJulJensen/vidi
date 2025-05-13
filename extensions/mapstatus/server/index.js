var express = require("express");
//var request = require("request");
var router = express.Router();
//var http = require("http");
//var https = require("https");
var moment = require("moment");
var config = require("../../../config/config.js");
//var he = require("he");
var fetch = require("node-fetch");
const { post } = require("request");
const { reject } = require("underscore");

// SET GC2 HOST
GC2_HOST = config.gc2.host;

// Set locale for date/time string
moment.locale("da_DK");

var BACKEND = config.backend;


var SCHEMA = "projekt";
var TABLEDATA = "projektdata";


var userString = function (req) {
    var userstr = "";
    if (req.session.subUser) {
        var userstr = req.session.gc2UserName + "@" + req.session.parentDb;
    } else {
        var userstr = req.session.gc2UserName;
    }
    return userstr;
};

function guard(req, response) {
    // Guard against missing skema
    //   if (!hasUserSetup(req.params.userid)) {
    //     response.status(401).send("User not found");
    //     return;
    //   }

    // guard against missing session (not logged in to GC2)
    if (!req.session.hasOwnProperty("gc2SessionId")) {
        response
            .status(401)
            .send("No active session - please login in the vidi application");
        return;
    }

    // else do nothing
    return;
}

// Use SQLAPI
function SQLAPI(q, req, options = null) {
    var userstr = userString(req);
    var postData = {
        key: req.session.gc2ApiKey,
        q: q,
    };

    // because we are running stuff though a parser, we need to be sure this is set for a primary host
    // we need SET SERVER ROLE TO 'primary'; first, and SET SERVER ROLE TO 'default'; after
    q = "SET SERVER ROLE TO 'primary'; " + q + "; SET SERVER ROLE TO 'default';";

    // if options is set, merge with postData
    if (options) {
        postData = Object.assign({}, postData, options);
    }

    var url = GC2_HOST + "/api/v2/sql/" + userstr;
    postData = JSON.stringify(postData);
    var options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Content-Length": Buffer.byteLength(postData),
            "GC2-API-KEY": req.session.gc2ApiKey,
        },
        body: postData,
    };

    // Return new promise
    return new Promise(function (resolve, reject) {
        //console.log(q.substring(0,175))
        fetch(url, options)
            .then((r) => r.json())
            .then((data) => {
                // if message is present, is error
                if (data.hasOwnProperty("message")) {
                    //console.log(data);
                    reject(data);
                } else {
                    //console.log('Success: '+ data.success+' - Q: '+q.substring(0,60))
                    resolve(data);
                }
            })
            .catch((error) => {
                console.log(error);
                reject(error);
            });
    });
}

// router.post("/api/extension/mapstatus/SetProject/:skema", (req, response) => {

// }


router.get(
    "/api/extension/mapstatus/GetProject/:skema/:projektid", (req, response) => {
        guard(req, response);
        const skema = req.params.skema;
        const projektid = req.params.projektid;
        const sql = `SELECT id, navn, beskrivelse,geojson FROM ${skema}.${TABLEDATA} where id = ${projektid}`;
        SQLAPI(sql, req)
            .then((result) => {
                response.json(result);
            })
            .catch((err) => {
                console.error("Fejl i SQLAPI:", err);
                response.status(500).send("Fejl ved databaseopslag");
            });
    });

router.get(
    "/api/extension/mapstatus/GetProjects/:skema", (req, response) => {
        guard(req, response);

        const skema = req.params.skema;
        const sql = `SELECT id, navn, beskrivelse FROM ${skema}.${TABLEDATA}`;

        // Pak SQLAPI i promise chain
        SQLAPI(sql, req)
            .then((result) => {
                response.json(result);
            })
            .catch((err) => {
                console.error("Fejl i SQLAPI:", err);
                response.status(500).send("Fejl ved databaseopslag");
            });
    }
);

module.exports = router;