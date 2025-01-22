# Node.js TypeScript Application

This is a Node.js application written in TypeScript with postgresql database and prisma orm. 

## Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Scripts](#scripts)
- [Running the Application](#running-the-application)
- [Folder Structure](#folder-structure)
- [Dependencies](#dependencies)
- [Contributing](#contributing)
- [License](#license)

---

## Prerequisites

Ensure you have the following installed on your system:

- **Node.js** (v16 or later) - [Download](https://nodejs.org/)
- **npm** or **yarn** for package management
- **TypeScript** (globally installed is optional)
- **YouTube API Key** (Get it from the [Google Cloud Console](https://console.cloud.google.com/))

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/ASRandD/AppSolute_api
   cd AppSolute



## Install dependencies:
  `npm install`
  or
 ` yarn`


## Environment Variables
Create a .env file in the root directory and add the following environment variables:

YOUTUBE_API_KEY=your-youtube-api-key
CHANNEL_ID=your-channel-id
PORT=your-server-port (default: 3000)


`npm run dev`
This uses ts-node to start the application in development mode.

Build:

``npm run build``
Compiles TypeScript to JavaScript into the dist folder.

Start Production Server:

npm start
Runs the built application from the dist folder.

## Running the Application
`npm run dev`

or 

`npm run build`
`npm start`

