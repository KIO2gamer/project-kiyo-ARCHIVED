# Kiyo Discord Bot

[![Netlify Status](https://api.netlify.com/api/v1/badges/a342cd56-0c9d-4650-8a27-3bbcf1889819/deploy-status)](https://app.netlify.com/sites/kiyo-verification/deploys)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://github.com/KIO2gamer/project-kiyo/blob/main/LICENSE.md)
[![Node.js Version](https://img.shields.io/node/v/kiyo-discord-bot.svg)](https://nodejs.org/)
[![npm version](https://badge.fury.io/js/kiyo-discord-bot.svg)](https://www.npmjs.com/package/kiyo-discord-bot) <!-- Replace with your actual npm package name if published -->
[![Discord Server](https://discord.com/api/guilds/YOUR_DISCORD_GUILD_ID/widget.png?style=shield)](https://discord.gg/YOUR_DISCORD_INVITE_CODE) <!-- Replace with your Discord server details -->

<!-- Optional Badges - Uncomment if applicable -->
<!-- [![GitHub Actions Status](https://github.com/KIO2gamer/project-kiyo/actions/workflows/build.yml/badge.svg)](https://github.com/KIO2gamer/project-kiyo/actions/workflows/build.yml) -->
<!-- [![Code Coverage](YOUR_CODE_COVERAGE_BADGE_URL)]() --> <!-- Add your code coverage badge URL if you have testing -->
<!-- [![Dependencies Status](https://dependency-badge.herokuapp.com/repos/KIO2gamer/project-kiyo/badge.svg)]() --> <!-- Or use a service like 'snyk' or 'renovate' for dependency badges -->
<!-- [![devDependencies Status](https://dependency-badge.herokuapp.com/repos/KIO2gamer/project-kiyo/dev-badge.svg)]() --> <!-- Or use a service like 'snyk' or 'renovate' for dev dependency badges -->
<!-- [![Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://prettier.io) -->
<!-- [![eslint](https://img.shields.io/badge/eslint-8.x-brightgreen.svg)](https://eslint.org/) -->

A versatile Discord bot packed with moderation, entertainment, and utility commands to enhance your server experience. Originally designed and tailored for the [TKOD Discord server](https://discord.gg/y3GvzeZVJ3), Kiyo offers a wide range of features to manage and engage your community.

**This bot is specifically designed for use within the [TKOD Discord server](https://discord.gg/y3GvzeZVJ3).**

## ✨ Features

- **Moderation:** Commands to help moderators manage the server effectively (e.g., ban, kick, mute, warn). _(Add specific moderation features here)_
- **Entertainment:** Fun and engaging commands to keep users entertained (e.g., games, image commands, meme generation). _(Add specific entertainment features here)_
- **Utility:** Useful tools and commands to provide information and enhance server functionality (e.g., weather, calculator, search, YouTube info). _(Add specific utility features here)_
- **YouTube Subscriber Roles:** Automatically assign roles to users based on their YouTube subscriber counts, encouraging community engagement.
- **And more!** Explore the commands to discover all the features Kiyo has to offer. _(Optional: Link to a command list or documentation if available)_

## 🛠️ Requirements

- **Node.js:** version 18.0.0 or higher ([Download Node.js](https://nodejs.org/))
- **npm:** (usually comes with Node.js) or any other Node.js package manager like [yarn](https://yarnpkg.com/) or [pnpm](https://pnpm.io/)

## 🚀 Installation

Get Kiyo up and running in a few simple steps:

1.  **Clone the repository:**

    ```sh
    git clone https://github.com/KIO2gamer/project-kiyo.git
    cd project-kiyo
    ```

2.  **Install dependencies:**

    ```sh
    npm install
    ```

3.  **Configuration:**

    - Create a `.env` file in the root directory of the project.
    - Add the necessary environment variables as listed below. **Ensure you replace the placeholder values with your actual credentials and IDs.**

    ```plaintext
    DISCORD_TOKEN=your_discord_token
    IGDB_CLIENT_SECRET=your_igdb_client_secret
    DISCORD_CLIENT_SECRET=your_discord_client_secret
    MONGODB_URI=your_mongodb_uri
    DISCORD_REDIRECT_URI=your_discord_redirect_uri
    GOOGLE_SEARCH_ENGINE_ID=your_google_search_engine_id
    IGDB_CLIENT_ID=your_igdb_client_id
    DISCORD_CLIENT_ID=your_discord_client_id
    DISCORD_GUILD_IDS=your_discord_guild_ids
    GOOGLE_API_KEY=your_google_api_key
    YOUTUBE_API_KEY=your_youtube_api_key
    PEXELS_API_KEY=your_pexels_api_key
    WEATHER_API_KEY=your_weather_api_key
    TENOR_API_KEY=your_tenor_api_key
    GIPHY_API_KEY=your_giphy_api_key
    MUSIXMATCH_API_KEY=your_musixmatch_api_key
    GEMINI_API_KEY=your_gemini_api_key
    ```

    **Important:** Keep your `.env` file secure and **do not commit it to your Git repository** if it contains sensitive information. It's already in `.gitignore`, but double-check!

4.  **Start the bot:**

    ```sh
    npm start
    ```

    The bot should now be online and ready to use in your Discord server.

## ☁️ Deployment

Get your own instance of Kiyo deployed!

1.  **Initialize Git (if not already done):**

    ```sh
    git init
    git add .
    git commit -m "Initial commit"
    ```

2.  **Connect to your remote repository:**

    ```sh
    git remote add origin https://github.com/KIO2gamer/project-kiyo.git
    git branch -M main
    git push -u origin main
    ```

3.  **Deploy to Netlify (Recommended):**

    - The easiest way to deploy Kiyo is using [Netlify](https://www.netlify.com/).
    - **Netlify Badge:** The badge at the top of this README shows the deployment status on Netlify.
    - **Steps:**

        1.  Sign up or log in to Netlify.
        2.  Click "Add new site" -> "Import an existing project".
        3.  Connect your GitHub repository where you pushed the code.
        4.  **Build settings (Important):**
            - **Build command:** `npm run build` _(If you have a build process, otherwise leave it blank or adjust accordingly)_
            - **Publish directory:** `dist` _(Or your build output directory if applicable)_
            - **Functions directory:** `netlify/functions` _(If you are using Netlify Functions)_
        5.  **Environment variables:** In Netlify's site settings, add all the environment variables you configured in your `.env` file.
        6.  Click "Deploy site".

    - Netlify will automatically build and deploy your bot. Any future pushes to your `main` branch will trigger automatic redeployments.

    - **Alternative Deployment Platforms:** You can also deploy Kiyo to other platforms like:
        - [Heroku](https://www.heroku.com/)
        - [AWS EC2](https://aws.amazon.com/ec2/)
        - [Google Cloud Compute Engine](https://cloud.google.com/compute)
        - [DigitalOcean](https://www.digitalocean.com/)
        - _(Add links and basic instructions for other platforms if you want to support them)_

## 🤝 Contributing

Contributions are welcome and greatly appreciated!

- **Bug Reports:** If you find a bug, please [open an issue](https://github.com/KIO2gamer/project-kiyo/issues) on GitHub to report it.
- **Feature Requests:** Have a great idea for a new feature? [Open an issue](https://github.com/KIO2gamer/project-kiyo/issues) to discuss it.
- **Pull Requests:** If you want to contribute code:

    1.  Fork the repository.
    2.  Create a new branch for your feature or bug fix (`git checkout -b feature/your-feature-name`).
    3.  Make your changes and commit them (`git commit -m 'Add some feature'`).
    4.  Push to your branch (`git push origin feature/your-feature-name`).
    5.  [Submit a pull request](https://github.com/KIO2gamer/project-kiyo/pulls).

    For major changes, please **open an issue first** to discuss what you would like to change and ensure it aligns with the project goals.

## 📜 License

This project is licensed under the **[MIT License](https://github.com/KIO2gamer/project-kiyo/blob/main/LICENSE.md)**. See the `LICENSE.md` file for details.

---

<p align="center">
  <sub><sup>Made with ❤️ by <a href="https://github.com/KIO2gamer">KIO2gamer</a> and contributors</sup></sub>
</p>
