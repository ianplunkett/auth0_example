import express, { Request, Response } from "express";
import { config } from "dotenv";
import axios from "axios";
import crypto from "crypto";
import path from "path";

// Load environment variables from .env file
config();

const app = express();
const port = 3000;

const client_id = process.env.AUTH0_CLIENT_ID;
const auth0_domain = process.env.AUTH0_DOMAIN;
const redirect_uri = "http://localhost:3000/callback";

/**
 * Generates a random code verifier for the PKCE flow.
 * @returns {string} A base64url encoded string.
 */
function generateCodeVerifier(): string {
    return crypto.randomBytes(32).toString("base64url");
}

/**
 * Generates a code challenge from the given code verifier.
 * @param {string} codeVerifier - The code verifier to be hashed.
 * @returns {string} A base64url encoded SHA-256 hash of the code verifier.
 */
function generateCodeChallenge(codeVerifier: string): string {
    const hash = crypto
        .createHash("sha256")
        .update(codeVerifier)
        .digest("base64");
    return hash.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

const code_verifier = generateCodeVerifier();
const code_challenge = generateCodeChallenge(code_verifier);

/**
 * Serves the homepage.
 * @route GET /
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
app.get("/", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

/**
 * Redirects the user to Auth0's authorization endpoint to initiate the login process.
 * @route GET /login
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
app.get("/login", (req: Request, res: Response) => {
    const authUrl = `${auth0_domain}/authorize?response_type=code&client_id=${client_id}&redirect_uri=${redirect_uri}&scope=openid profile email&code_challenge=${code_challenge}&code_challenge_method=S256`;
    res.redirect(authUrl);
});

/**
 * Handles the callback from Auth0 after the user has authenticated.
 * Exchanges the authorization code for an access token.
 * @route GET /callback
 * @param {Request} req - The request object.
 * @param {Response} res - The response object.
 */
app.get("/callback", async (req: Request, res: Response) => {
    const { code } = req.query;

    try {
        const response = await axios.post(`${auth0_domain}/oauth/token`, {
            grant_type: "authorization_code",
            client_id: client_id,
            code_verifier: code_verifier,
            code: code as string,
            redirect_uri: redirect_uri,
        });
        res.json(response.data);
    } catch (error: any) {
        res.status(500).json({ error: error.response?.data });
    }
});

/**
 * Starts the Express server.
 * @param {number} port - The port on which the server will listen.
 */
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
