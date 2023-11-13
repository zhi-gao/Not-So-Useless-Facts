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

if [[ -e .env ]]; then
    echo "The file .env exists, skipping"
else
    echo "The file .env does not exist, creating the file"
    sleep 1
    echo -e "DEV_MODE=dev\nPORT=\nFRONTEND_HOST=\nDATABASE_PASSWORD=\nDATABASE_URL=\n" > .env
fi

cd ..
echo "-------------------------------------------------"
echo "Installing dependencies in the frontend directory"
echo "-------------------------------------------------"

sleep 1

cd frontend
npm install

cd ..

echo "All dependencies have been installed, please update the .env files"
echo "To run the frontend, do cd frontend && npm run dev"
echo "To run the backend, do cd backend && npm run dev"

exec bash