# Not So Useless Facts

Provide random fact everyday!

Online demo link https://not-so-useless-facts.fly.dev/


## Installation
1. Manually
    1. Run `npm install` in the both frontend and backend folder
    2. Create a .env file in the backend folder by running `cd backend && touch .env`
    3. Copy and paste the env template provided below, make sure you have a **valid MongoDB link**
        
2. Automatically
    1. Run the `install.sh` script
        - `chmod +x install.sh`
        - `bash install.sh`
    2. Fill out the .env parameters (template given below)


## Enviroment File Template
```
DEV_MODE=dev
PORT=4000
FRONTEND_HOST=http://localhost:3000/
DATABASE_PASSWORD=abc123
DATABASE_URL=mongodb://root:abc123@localhost:27017/nsuf?directConnection=true&authSource=admin&retryWrites=true
API_NINJA_API_KEY=
```

## Database
You can get a database connection with either MongoDB ATLAS, locally if hosted on your computer, or using Docker (fastest and recommended).

Once you have setup your server, just update your `.env` and changed the variable `DATABASE_URL=mongodb://root:<mongodb-password>@<host>:<port>/<project-name>?directConnection=true&authSource=admin&retryWrites=true`

## Contributing
If you are going to push your changes, **please push to a seperate branch FIRST and submit a PR**.

Feel free to assign one of us to review your code and push if it has been approved.

Once your changes has been merged with main, **please delete the branch** to avoid any further confusion going forward.

**It is recommended that your branch should be named related to the feature/bug that you are current working with**

|Feature/bugs| Sample Branch Name |
--------------|-----------------
|Front page CSS | front-page-css|
|Display upvotes/downvotes to user | display-ratings|
|Fixing the 3rd API with invalid params | fixing-backend-api|

## Contributors:
Chenhao Li

Richard Yeung

Zhi Gao
