#!/bin/bash

parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )

echo "Working in $parent_path..."
cd "$parent_path"

cd ./frontend
npm run build
cd ..

cd ./backend
npm run build
cd ..

cp -R ./frontend/dist ./backend/dist