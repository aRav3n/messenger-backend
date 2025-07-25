# Messenger Project Backend

## Table of Contents

- [Description](#description)
- [Usage and Screenshots](#usage-and-screenshots)
- [Technologies Used](#technologies-used)
- [Dependencies and Credits](#dependencies-and-credits)
- [Project Structure](#project-structure)

## Description

This is the RESTful API created for my messenger app as a part of [The Odin Project](https://www.theodinproject.com) curriculum (Full Stack JavaScript track)

## Usage and Screenshots

The API can be used by using the endpoints listed below.

- [Link to frontend repo](https://github.com/aRav3n/messenger_frontend_TOP)
- Base URL: https://messenger-backend-top.onrender.com

### API Usage:

- User Routes
  - Sign up
    - **POST** /user/signup [^1]
  - Log in
    - **POST** /user/login [^2]
  - Delete account
    - **DELETE** /user/:userId/delete [^3]
- Friend Routes
  - Add friend
    - **POST** /friend [^4]
  - List friends
    - **GET** /friend/:userId [^5]
  - Delete friend
    - **DELETE** /friend/friendId [^6]
- Message Routes
  - Send a message
    - **POST** /message/:friendId [^7]
  - List message thread for a friendship
    - **GET** /message/friend/:friendId [^8]
  - Delete a message
    - **DELETE** /message/:messageID [^9]

**Route Notes**
[^1]: Expects { name, password, confirmPassword }. Returns { id, name, hash }.
[^2]: Expects { name, password }. Returns { token } property which contains the JSON Web Token for the user.
[^3]: **Requires auth header**. Expects { name, password }. Sends a status code 200.
[^4]: **Requires auth header**. Expects { _name_ }. Returns status 200 and { message: "New friendship with _name_ added!" }.
[^5]: Expects only the user's id in the URL. Returns an array of user objects (see note 1 above).
[^6]: **Requires auth header**. Expects { name }. Returns { id, userAId, userBId } for the deleted friendship.
[^7]: **Requires auth header**. Expects { message }. Returns { id, senderId, receiverId, messageBody }.
[^8]: **Requires auth header**. Expects only the friend's id in the URL. Returns an array of message objects (see note 7 above).
[^9]: **Requires auth header**. Expects only the message id in the URL. Returns message object (see note 7 above).

### Features
- Uses CORS to verify that the domain requesting access is valid
- Routes are fully tested

## Technologies Used

### Backend          
- <a href="https://nodejs.org"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg" style="height: 2rem; width: auto;"> Node.js</a>
- <a href="https://expressjs.com/"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg" style="height: 2rem; width: auto;"> Express</a>
- <a href="https://www.postgresql.org/"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg" style="height: 2rem; width: auto;"/> PostgreSQL</a>
- <a href="https://www.prisma.io/"><img src="https://skillicons.dev/icons?i=prisma" style="height: 2rem; width: auto;"/> Prisma ORM</a>
- <a href="https://www.typescriptlang.org/"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/typescript/typescript-original.svg" style="height: 2rem; width: auto;"/> TypeScript</a>
- <a href="https://jestjs.io/"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/jest/jest-plain.svg" style="height: 2rem; width: auto;"/> Jest</a>

### Development Tools

- <a href="https://code.visualstudio.com/"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vscode/vscode-original.svg" style="height: 24px; width: auto;"/> VS Code</a>
- <a href="https://www.npmjs.com/"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/npm/npm-original.svg" style="height: 24px; width: auto;"/> NPM</a>
- <a href="https://git-scm.com/"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg" style="height: 24px; width: auto;"/> Git</a>

### Hosting

- <a href="https://github.com/"><img src="https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/github/github-original.svg" style="height: 24px; width: auto;"/> Github</a>
- <a href="https://neon.com/"><img src="https://neon.com/brand/neon-logomark-light-color.svg" style="height: 24px; width: auto;"/> Neon</a>
- <a href="https://render.com/"><img src="https://render.com/icon.svg" style="height: 24px; width: auto;"/> Render</a>


## Dependencies and Credits

### Package Dependencies

- [@prisma/extension-accelerate](https://www.npmjs.com/package/@prisma/extension-accelerate)
- [@prisma/client](https://www.npmjs.com/package/@prisma/client)
- [@types/node](https://www.npmjs.com/package/@types/node)
- [bcryptjs](https://www.npmjs.com/package/bcryptjs)
- [cors](https://www.npmjs.com/package/cors)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [express-validator](https://www.npmjs.com/package/express-validator)
- [jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)
- [pg](https://www.npmjs.com/package/pg)
- [supertest](https://www.npmjs.com/package/supertest)
- [tsx](https://www.npmjs.com/package/tsx)

### Other Credits

- [Devicion](https://devicon.dev/)
- [Skillicons](https://skillicons.dev/)

## Project Structure

```bash
├──controllers/            # Controller files
├──db/                     # Compiled queries.js file located here
├──generated/              # Generated Prisma files
├──prisma/                 # Prisma models and migrations
├──routes/                 # Router files
├──src/                    # Raw uncompiled queries.ts file located here
└──test/                   # Test files located here
```
