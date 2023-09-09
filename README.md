# twitter-verification
A basic Node.js Project that can check if user is following or not. THIS MIGHT NOT GET CORRECTLY IF HIGH AMOUNTS BECAUSE IT MIGHT NOT GET ALL.

Using API from https://rapidapi.com/twttrapi-twttrapi-default/api/twttrapi. MUST GET AN RAPIDAPI ACCOUNT to use this!!

Twitter Session must be get from Login with Email/Username POST request in the Login API above! If you have 2FA on the account, it will give login data, use that in the Login with 2FA request! PLEASE DONT USE YOUR MAIN ACCOUNT, USE A DUMMY ACCOUNT.

I am not responsible if the API owner steals your session and does things you may not want to know.
I am not paying for any costs for this project!!
Use 20 as default as higher or lower can cost money!!

Install Packages Command: npm install express cors body-parser path

When sending requests to the server, please include the authorization key in the x-authorization if have set a key. Leaving the key blank in settings.json will just allow every request.

GET /following/{username} => Get users that the username is following
GET /follower/{username} => Get users that are following the username
GET /userid/{username} => Get User ID of Twitter Account.
POST /verify/followers => Get if user is following target user by looking through the target's follower's list.
Body Example: {"username": "EfazDev"}
POST /verify/following => Get if user is following target user by looking through their following list.
Body Example: {"username": "EfazDev"}