# DokSus OKIRU Client Documentation

## Purpose
This is the frontend web application for the DokSus restoration documentation system. It manages the creation and storage of conservation-restoration documentation, as well as research, seminar, and diploma theses at the Department of Conservation and Restoration of Works of Art at the Academy of Fine Arts in Zagreb.

## Technology
* **Language:** TypeScript
* **Framework:** Preact
* **Build Tool:** Vite
* **HTTP Client:** Axios

### Additional Dependencies
* **3D Rendering:** @google/model-viewer

## Prerequisites
* **Node.js:** Version 18 or higher.
* The backend API (Spring Boot) must be running on `http://localhost:8080` to handle data requests and file uploads.

## Recommended IDE
**IntelliJ IDEA** or **Visual Studio Code**. The project uses Vite and TypeScript, which are natively supported by both environments.

## Development Setup
The `node_modules` directory is excluded from version control. To set up the environment locally, open the terminal in the project root and install the dependencies defined in `package.json`:

```bash
npm install
```

## Running the Project
To start the Vite development server with Hot Module Replacement (HMR), run:
``` bash
npm run dev
```
- The application will be accessible at http://localhost:5173.
