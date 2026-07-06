import app from './app.js';
import dotenv from 'dotenv';

/**
 * Konfigurerar miljövariabler från .env-filen och startar Express-applikationen på den angivna porten.
 */
dotenv.config();

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Running on http://localhost:${PORT}`);
});