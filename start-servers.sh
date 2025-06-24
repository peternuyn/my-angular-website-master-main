#!/bin/bash

echo "Starting Resume Sharing Platform..."
echo

echo "Starting Backend Server..."
cd server
npm install &
npm start &
cd ..

echo "Waiting 5 seconds for backend to start..."
sleep 5

echo "Starting Frontend Server..."
npm install &
npm start &

echo
echo "Both servers are starting..."
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:4200"
echo
echo "Press Ctrl+C to stop all servers"
wait 