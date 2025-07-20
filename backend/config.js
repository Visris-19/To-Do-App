// CommonJS export
// module.exports = {
//     PORT: process.env.PORT || 5000,
//     mongoDBURL: process.env.MONGODB_URI || "mongodb+srv://root:4hnITwgFuQXJK0Ot@cluster0.kix3eqt.mongodb.net/To-Do_App?retryWrites=true&w=majority&appName=Cluster0",
//     GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "78825296226-1jsslj47ihdog3hmu3ufm4t1e4d94b07.apps.googleusercontent.com",
//     GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "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",
//     GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || "Ov23linWFRhvEfFe0MCa",
//     GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || "d4a00f3346bde6493e279e6e4b45670fdaab8168",
//     SESSION_SECRET: process.env.SESSION_SECRET || "6a956688be638b5428eb10796026f32e2d5ab0fb35c717665b64633905a61d16",
//     JWT_SECRET: process.env.JWT_SECRET || "2fe64a0efef2e5d567a62bfbddcc0903f251b9df57e5a57a4fc17343ae6f8a53fece211897392d88ceb73f607208a1a798c31eee72a9d3bb4ca6b8d381bb93ed"
// };

module.exports = {
    PORT: process.env.PORT,
    mongoDBURL: process.env.MONGODB_URI,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET, 
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    SESSION_SECRET: process.env.SESSION_SECRET,
    JWT_SECRET: process.env.JWT_SECRET
};
  