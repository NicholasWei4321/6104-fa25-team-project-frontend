# Music Discovery App - Frontend

This is the Vue.js frontend for the Music Discovery application.

## Tech Stack

- **Vue 3** - Progressive JavaScript framework
- **Vite** - Fast build tool and dev server
- **Pinia** - State management
- **Vue Router** - Client-side routing
- **Axios** - HTTP client for API calls

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Preview Production Build

```sh
npm run preview
```

## Project Structure

```
src/
├── assets/       # Static assets (CSS, images, etc.)
├── components/   # Reusable Vue components
├── views/        # Page-level components
├── router/       # Vue Router configuration
├── stores/       # Pinia stores for state management
├── App.vue       # Root component
└── main.js       # Application entry point
```

## Development

The development server will run on `http://localhost:5173` by default (or next available port).

**Important:** The backend API must be running on `http://localhost:8000` before starting the frontend.

### Starting the Backend

From the backend project directory:
```sh
cd ../6104-fa25-team-project
deno task concepts
```

The frontend is configured to proxy all `/api` requests to `http://localhost:8000`.
