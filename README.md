# ShelfSmart

ShelfSmart is a web application for cataloging your physical book library. Upload images of your bookshelves, and ShelfSmart will automatically extract book titles and authors using the OpenAI GPT-4o Vision API, retrieve ISBN information from the Google Books API, and store the data in an Azure SQL database.

## Features

- **Image Upload**: Upload images of your bookshelves
- **Book Extraction**: Automatically extract book titles and authors from images using OpenAI GPT-4o Vision API
- **ISBN Lookup**: Retrieve ISBN-10 and ISBN-13 identifiers from the Google Books API
- **Book Catalog**: View your book collection in a tabular format with Title, Author, ISBN, and Date Added columns
- **Export**: Download your book catalog as a CSV file

## Tech Stack

- **Frontend**: React, Tailwind CSS
- **Backend**: Next.js
- **Database**: Azure SQL Database
- **APIs**: OpenAI GPT-4o Vision API, Google Books API

## Prerequisites

Before running this application, you'll need:

1. An Azure SQL Database instance
2. An OpenAI API key with access to the GPT-4o model
3. Node.js (v18 or newer)
4. npm or yarn

## Getting Started

1. Clone the repository

```bash
git clone https://github.com/yourusername/shelf-smart.git
cd shelf-smart
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

3. Create a `.env.local` file in the project root with the following variables:

```env
# Azure SQL Database Configuration
DB_SERVER=your-azure-sql-server.database.windows.net
DB_NAME=your-database-name
DB_USER=your-database-username
DB_PASSWORD=your-database-password

# OpenAI API Configuration
OPENAI_API_KEY=your-openai-api-key

# App Configuration
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. Start the development server

```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Azure App Service
- See [Deploying a Next.js Application Using Azure App Service](https://www.c-sharpcorner.com/article/deploying-a-next-js-application-using-azure-app-service/)
- Build your app:
  ```bash
  npm run build
  ```
- Typical Azure build steps:
  ```bash
  # 1. Clean slate
  rm -rf node_modules .next

  # 2. Install dependencies
  npm install  # or `npm ci`

  # 3. Build your Next.js app
  npm run build

  # 4. Prune out dev‑only dependencies
  npm prune --production

  # 5. Start your app
  npm run start
  ```

### Local Tunnel (ngrok)
- Deploy with your static ngrok domain:
  ```bash
  ngrok http --url=arguably-guiding-mammoth.ngrok-free.app 3000
  ```

### Initialize Database Schema
- If your Azure SQL database is empty, create the schema with:
  ```bash
  npx prisma db push
  ```

## Usage

1. **Upload an Image**: Click the "Select a photo of your bookshelf" button and choose an image of your bookshelf.
2. **Wait for Processing**: The application will upload your image, extract book information, and retrieve ISBN data.
3. **View Your Catalog**: Your books will appear in the table below the upload form.
4. **Export as CSV**: Click the "Export as CSV" button to download your book catalog.

## License

MIT
