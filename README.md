# E-Notes

[![GitHub issues](https://img.shields.io/github/issues/appventure-nush/e-notes)](https://github.com/appventure-nush/e-notes/issues)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/appventure-nush/e-notes/Node.js%20CI)
[![GitHub stars](https://img.shields.io/github/stars/appventure-nush/e-notes)](https://github.com/appventure-nush/e-notes/stargazers)
![Typescript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1?logo=TypeScript&logoColor=white)

**E**lectronic **Notes** management system.

### Functions

- Role based permission system
- User & role management system
- Display notes in Markdown, HTML or Jupyter Notebooks
- Management of collections and notes
- Image uploading

### Maintaining

- [frontend/](frontend/)
    - Vue.js application written in typescript
    - Is the frontend of the application, everything is client side
- [backend/](backend/)
    - express.js API backend written in typescript
    - Is the backend of the application, everything is server side
- IDE (optional)
    - .idea/: **WebStorm** by JetBrains

### Testing/Development

To run the application, two npm scripts are to be run simultaneously.

- backend/ `npm run start:dev` with environment `ENVIRONMENT=local`
    - This will run the backend server on port 8080 unless otherwise specified with `PORT` environment
    - Will automatically restart when changes are made to the code base
    - This is the access point (the application)
- frontend/ `npm run serve`
    - Will run the frontend on port 8090
    - This will be used by the backend (the backend acts as a proxy to port 8090)
    - 8090 the port is hardcoded into the backend proxy (proxy only used for development)
    - Will automatically restart when changes are made to the code base
    - This is the frontend, but do not access this port

#### Building

Simply run `npm run build` under backend to build both backend and frontend. The frontend build output is also
automatically copied over.