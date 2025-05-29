/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// ✅ IMPORTAR FUNÇÕES FCM
const {
  registerFCMToken,
  getMyTokens,
  generateNewTokens,
  deleteTokens,
  validateTokens,
  getStoreTokenStats,
  cleanupOldTokens
} = require("./src/api/fcmTokens");

// ✅ EXPORTAR FUNÇÕES FCM
exports.registerFCMToken = registerFCMToken;
exports.getMyTokens = getMyTokens;
exports.generateNewTokens = generateNewTokens;
exports.deleteTokens = deleteTokens;
exports.validateTokens = validateTokens;
exports.getStoreTokenStats = getStoreTokenStats;
exports.cleanupOldTokens = cleanupOldTokens;

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });
