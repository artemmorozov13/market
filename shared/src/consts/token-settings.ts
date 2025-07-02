export const accessCookiesOptions = {
  expires: new Date(Date.now() + 30 * 60 * 1000),
  // secure: true,
  // httpOnly: true,
  // sameSite: 'strict'
};

export const refreshCookiesOptions = {
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  // secure: false,
  // httpOnly: true,
  // sameSite: 'strict'
};
