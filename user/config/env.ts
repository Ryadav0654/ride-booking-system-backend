export const config = {
  accessTokenSecret:
    process.env.JWT_SECRET ??
    (() => {
      throw new Error("JWT_SECRET missing");
    })(),
  refreshTokenSecret:
    process.env.JWT_SECRET ??
    (() => {
      throw new Error("JWT_SECRET missing");
    })(),
};
