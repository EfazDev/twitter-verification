const express = require("express");
const cors = require("cors");
const settings = require("./settings.json")
const app = express();
const { json } = require("body-parser");
var path = require("path")

var AuthorizationKey = settings["AuthorizedKey"]
var UserId = "0"
var SystemStarted = false
var MaxCount = settings["MaxCount"]

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors())

async function getUserByUsername(username) {
  var url = `https://twttrapi.p.rapidapi.com/get-user?username=${username}`;
  var options = {
    method: 'GET',
    headers: {
      'twttr-session': settings["TwitterSession"],
      'X-RapidAPI-Key': settings["RapidAPIKey"],
      'X-RapidAPI-Host': 'twttrapi.p.rapidapi.com'
    }
  };
  const response = await fetch(url, options);
  return await response.json();
}

async function getUserIdByUsername(username) {
  var url = `https://twttrapi.p.rapidapi.com/get-user?username=${username}`;
  var options = {
    method: 'GET',
    headers: {
      'twttr-session': settings["TwitterSession"],
      'X-RapidAPI-Key': settings["RapidAPIKey"],
      'X-RapidAPI-Host': 'twttrapi.p.rapidapi.com'
    }
  };
  const response = await fetch(url, options);
  return response.json().then(user_info => {
    return {"success": false, "id": user_info["id_str"]}
  }).catch(e => {
    return {"success": false, "error": "Failed to get id."}
  });
}

async function getUserFollowing(username) {
  var url = `https://twttrapi.p.rapidapi.com/user-following?username=${username}&count=${MaxCount}`;
  var options = {
    method: 'GET',
    headers: {
      'twttr-session': settings["TwitterSession"],
      'X-RapidAPI-Key': settings["RapidAPIKey"],
      'X-RapidAPI-Host': 'twttrapi.p.rapidapi.com'
    }
  };
  const response = await fetch(url, options);
  return response.json()
    .then(new_json => {
      var generated_response = { "success": true, "users": [] }
      if (new_json["errors"]) {
        generated_response = { "success": false, "error": "User doesn't exist on Twitter." }
      } else if (!(new_json["data"]) || !new_json["data"]["user"]) {
        generated_response = { "success": false, "error": "Twitter Servers are busy. Try again later." }
      } else if (username.includes("EfazDev")) {
        generated_response = { "success": false, "error": "You can't use the creator's name." }
      } else {
        var main_data = new_json["data"]["user"]["timeline_response"]["timeline"]["instructions"]
        for (let i = 0; i < main_data.length; i++) {
          if (main_data[i]["__typename"] == "TimelineAddEntries") {
            var entries = main_data[i]["entries"]
            for (let g = 0; g < entries.length; g++) {
              var entry = entries[g]
              var contentA = entry["content"]
              if (contentA["__typename"] == "TimelineTimelineItem") {
                var result = contentA["content"]["userResult"]["result"]
                if (result["__typename"] == "User") {
                  var final_user_id = result["legacy"]["id_str"]
                  generated_response["users"].push(final_user_id)
                }
              }
            }
          }
        }
      }

      return generated_response
    })
    .catch(e => {
      console.log(`Failed to get followings: ${e}`)
      return { "success": false, "error": "Failed to get response from Twitter Server." }
    })
}

async function getUserFollowers(username) {
  var url = `https://twttrapi.p.rapidapi.com/user-followers?username=${username}&count=${MaxCount}`;
  var options = {
    method: 'GET',
    headers: {
      'twttr-session': settings["TwitterSession"],
      'X-RapidAPI-Key': settings["RapidAPIKey"],
      'X-RapidAPI-Host': 'twttrapi.p.rapidapi.com'
    }
  };
  const response = await fetch(url, options);
  return response.json()
    .then(new_json => {
      var generated_response = { "success": true, "users": [] }
      if (new_json["errors"]) {
        generated_response = { "success": false, "error": "User doesn't exist on Twitter." }
      } else if (!(new_json["data"]) || !new_json["data"]["user"]) {
        generated_response = { "success": false, "error": "Twitter Servers are busy. Try again later." }
      } else if (username.includes("EfazDev")) {
        generated_response = { "success": false, "error": "You can't use the creator's name." }
      } else {
        var main_data = new_json["data"]["user"]["timeline_response"]["timeline"]["instructions"]
        for (let i = 0; i < main_data.length; i++) {
          if (main_data[i]["__typename"] == "TimelineAddEntries") {
            var entries = main_data[i]["entries"]
            for (let g = 0; g < entries.length; g++) {
              var entry = entries[g]
              var contentA = entry["content"]
              if (contentA["__typename"] == "TimelineTimelineItem") {
                var result = contentA["content"]["userResult"]["result"]
                if (result["__typename"] == "User") {
                  var final_user_id = result["legacy"]["id_str"]
                  generated_response["users"].push(final_user_id)
                }
              }
            }
          }
        }
      }

      return generated_response
    })
    .catch(e => {
      console.log(`Failed to get followers: ${e}`)
      return { "success": false, "error": "Failed to get response from Twitter Server." }
    })
}

getUserByUsername(settings["TargetUsername"]).then(user_info => {
  UserId = user_info["id_str"]
  console.log(`"Loaded User ID: ${user_info["id_str"]}!`)
  SystemStarted = true
}).catch(e => {
  console.log(`Error while starting the Twitter API System: ${e}`)
  SystemStarted = false
})

app.use((req, res, next) => {
  ipaddresses = req.header('do-connecting-ip') || req.socket.remoteAddress;
  console_log_message = `URL: https://api.efaz.dev${req.url} | IPs: ${JSON.stringify(ipaddresses)} | Type: ${req.method} | HTTP Version: ${req.httpVersion}`
  console.log(console_log_message);
  if (req.body) {
    console.log("Request has included body: " + JSON.stringify(req.body))
  }
  next();
});

app.all("/", (req, res) => {
  if (SystemStarted == true) {
    try {
      if (req.body) {
        console.log("Received Response: " + JSON.stringify(req.body))
      }
      res.json({ "message": "OK", "success": true })
    } catch (e) {
      res.json({
        "success": false,
        "message": e
      });
    }
  } else {
    res.json({
      "success": false,
      "message": "Twitter Verification is currently off."
    });
  }
});

app.get("/following/:username", (req, res) => {
  if (SystemStarted == true) {
    if (req.get("x-authorization") == AuthorizationKey || AuthorizationKey == "") {
      try {
        res.json(getUserFollowing(req.params.username))
      } catch (e) {
        res.status(400)
        res.json({
          "success": false,
          "error": e
        });
      }
    } else {
      res.status(403)
      res.json({
        "success": false,
        "error": "Unauthorized"
      });
    }
  } else {
    res.json({
      "success": false,
      "error": "Twitter Verification is currently off."
    });
  }
})

app.get("/follower/:username", (req, res) => {
  if (SystemStarted == true) {
    if (req.get("x-authorization") == AuthorizationKey || AuthorizationKey == "") {
      try {
        res.json(getUserFollowers(req.params.username))
      } catch (e) {
        res.status(400)
        res.json({
          "success": false,
          "error": e
        });
      }
    } else {
      res.status(403)
      res.json({
        "success": false,
        "error": "Unauthorized"
      });
    }
  } else {
    res.json({
      "success": false,
      "error": "Twitter Verification is currently off."
    });
  }
})

app.get("/userid/:username", (req, res) => {
  if (SystemStarted == true) {
    if (req.get("x-authorization") == AuthorizationKey || AuthorizationKey == "") {
      try {
        res.json(getUserIdByUsername(req.params.username))
      } catch (e) {
        res.status(400)
        res.json({
          "success": false,
          "error": e
        });
      }
    } else {
      res.status(403)
      res.json({
        "success": false,
        "error": "Unauthorized"
      });
    }
  } else {
    res.json({
      "success": false,
      "error": "Twitter Verification is currently off."
    });
  }
})

app.post("/verify/followers", (req, res) => {
  if (SystemStarted == true) {
    if (req.get("x-authorization") == AuthorizationKey || AuthorizationKey == "") {
      try {
        var username = req.body.username
        if (username) {
          getUserIdByUsername(username).then(res => {
            if (res["success"] == true) {
              getUserFollowers(settings["TargetUsername"])
            .then((json) => {
                if (json["success"] == true) {
                    if (json["users"]) {
                        following = false
                        for (let i = 0; i < json["users"].length; i++) {
                            id = json["users"][i]
                            if (id == res["id"]) {
                                following = true
                            }
                        }
                        if (following == true) {
                            res.json({
                                "success": true,
                                "message": "User is following!"
                            });
                        } else {
                            res.json({
                                "success": false,
                                "message": "This account is not following on Twitter or the system couldn't find you."
                            });
                        }
                    } else {
                        res.json({
                            "success": false,
                            "message": `Failed to async users followed by @${username}.`
                        });
                    }
                } else {
                    res.json({
                        "success": false,
                        "message": json["error"]
                    });
                }
            })
            } else {
              res.json({
                "success": false,
                "message": "User doesn't exist."
              });
            }
          })
        } else {
          res.json({
            "success": false,
            "message": "Username wasn't given."
          });
        }
      } catch (e) {
        res.status(400)
        res.json({
          "success": false,
          "message": e
        });
      }
    } else {
      res.status(403)
      res.json({
        "success": false,
        "message": "Unauthorized"
      });
    }
  } else {
    res.json({
      "success": false,
      "message": "Twitter Verification is currently off."
    });
  }
})

app.post("/verify/following", (req, res) => {
  if (SystemStarted == true) {
    if (req.get("x-authorization") == AuthorizationKey || AuthorizationKey == "") {
      try {
        var username = req.body.username
        if (username) {
          getUserFollowing(username)
            .then((json) => {
                if (json["success"] == true) {
                    if (json["users"]) {
                        following = false
                        for (let i = 0; i < json["users"].length; i++) {
                            id = json["users"][i]
                            if (id == UserId) {
                                following = true
                            }
                        }
                        if (following == true) {
                            res.json({
                                "success": true,
                                "message": "User is following!"
                            });
                        } else {
                            res.json({
                                "success": false,
                                "message": "This account is not following on Twitter or the system couldn't find you."
                            });
                        }
                    } else {
                        res.json({
                            "success": false,
                            "message": `Failed to async users followed by @${username}.`
                        });
                    }
                } else {
                    res.json({
                        "success": false,
                        "message": json["error"]
                    });
                }
            })
        } else {
          res.json({
            "success": false,
            "message": "Username wasn't given."
          });
        }
      } catch (e) {
        res.status(400)
        res.json({
          "success": false,
          "message": e
        });
      }
    } else {
      res.status(403)
      res.json({
        "success": false,
        "message": "Unauthorized"
      });
    }
  } else {
    res.json({
      "success": false,
      "message": "Twitter Verification is currently off."
    });
  }
})

app.use(function (req, res) {
  res.status(404)
  res.json({ "error": "Not Found" })
});
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500)
  res.json({
    "success": false, "error": "Server Error"
  })
})

const port = process.env.PORT || 443;
app.listen(port, () => {
  console.log(`
  Running on port: ${port}

  Try out at http://localhost:${port}/follower/{username}!
  Console Logs:
  `)
});