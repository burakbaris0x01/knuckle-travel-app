const isProduction = process.env.NODE_ENV === 'production'

const authCookieOptions = {
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000,
  sameSite: isProduction ? 'None' : 'Lax',
  secure: isProduction,
  path: '/',
}

const accessCookieOptions = {
  ...authCookieOptions,
  httpOnly: false,
}

const clearCookieOptions = {
  httpOnly: true,
  sameSite: authCookieOptions.sameSite,
  secure: authCookieOptions.secure,
  path: '/',
}

module.exports = {
  accessCookieOptions,
  authCookieOptions,
  clearCookieOptions,
}
