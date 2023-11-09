# Not So Useless Facts

Provide random fact everyday!

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
```

## Contributors:
Chenhao Li
Richard Yeung
Zhi Gao
