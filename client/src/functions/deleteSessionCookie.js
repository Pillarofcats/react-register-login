function deleteSessionCookie () {
  console.log('deleting...')
  document.cookie = "sessionID=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=.railway.app;"
  console.log('deleted value', document.cookie)
}

export default deleteSessionCookie