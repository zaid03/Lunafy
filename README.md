## Lunafy
    -Lunafy is a Spotify-powered web application that connects with your Spotify account to analyze your listening habits, visualize stats, and offer musical insights.

## Project Status
    Lunafy backend and frontend are fully implemented, with user authentication, Spotify integration, personalized stats, playlist creation, and more.
    Admin panel development is planned next.

## Features

- Spotify authentication and integration
- Personalized music stats and insights
- Playlist creation based on your top tracks
- Email verification for account security
- Responsive React frontend

## Project Structure

    /lunafy
    ├── backend     # Node.js backend (Express + Spotify OAuth)
    │   ├── controller    # Route controllers (business logic)
    │   ├── models        # Database models/queries
    │   ├── routes        # API route definitions
    │   ├── config        # DB and environment config
    │   └── server.js     # Main backend entry point
    └── frontend          # React frontend (User interface)
        └── src
            ├── Assets
            ├── components    # React components
            └── App.jsx         # Main React app entry point

## Tech Stack
- Frontend: React
- Backend: Node.js + Express
- Database: MySQL
- Authentication: Spotify OAuth 2.0
- Email: Nodemailer (Gmail SMTP)
- State Management: React useState/useEffect (no Redux)
- HTTP Client: Axios

## Hosting:
    - Frontend: Vercel
    - Backend: TBD

## License: MIT

## Security

- This project uses environment variables to manage secrets (such as API keys, database credentials, and client secrets).
- **Never expose your `client_secret` or commit your `.env` file to version control.**
- Always use `.gitignore` to prevent sensitive files from being uploaded to public repositories.
- For production, use secure methods to inject environment variables (such as deployment platform secrets).

## Setup Instructions

*Coming Soon*

## License

This project is licensed under the MIT License.

## Contact

For questions or feedback, open an issue or contact terguyzaid@gmail.com.