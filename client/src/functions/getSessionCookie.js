function getSessionCookie () {
  // console.log('cookies', document.cookie)
  const cPattern = new RegExp('sessionID=.[^;]*')
  const cMatch = document.cookie.match(cPattern)
  if(cMatch) {
    const cData = cMatch[0].split('=')
    return cData[1]
  }
  return ""
}

export default getSessionCookie