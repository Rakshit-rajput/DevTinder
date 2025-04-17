
## Authentication Router
- POST API 
- POST /signup
- POST /loginup
- POST /logout

## Profile Router
- GET/profile/view
- GET/profile/edit
- PATCH/profile/password

<!-- connection request -->
## Connection Router
<!-- status: ignore, interested, accepted,rejected -->

- POST /request/send/interested/:userID
- POST /request/send/rejected/:userID

- POST /request/review/accepted/:requestID
- POST /request/review/rejected/:requestID

- GET /connections
- GET /requests/recieved
- GET /feed  --gets you the profiles of other users on platform


