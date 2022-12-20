//Component
function ServerMessage({isMessage, setIsMessage, msg}) {
  setTimeout(() => {
      setIsMessage(false)
  }, 12000);
  //Render
  return(
    <>
    {isMessage ? <h4 className={`${msg[0]} server-msg`}>{msg[1]}</h4> : <h4 className="hidden server-msg">{msg[1]}</h4>}
    </>
  )
}

export default ServerMessage