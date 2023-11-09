echo "-------------------------------------------------"
echo "Installing dependencies in the backend directory"
echo "-------------------------------------------------"

sleep 1

cd backend
npm install

echo "-------------------------------------------------"
echo "Creating a .env file"
echo "-------------------------------------------------"

sleep 1

echo -e "DEV_MODE=dev\nPORT=\nFRONTEND_HOST=\nDATABASE_PASSWORD=\nDATABASE_URL=\nAPI_NINJA_API_KEY=\n" > .env

cd ..
echo "-------------------------------------------------"
echo "Installing dependencies in the frontend directory"
echo "-------------------------------------------------"

sleep 1

cd frontend
npm install

cd ..

exec bash