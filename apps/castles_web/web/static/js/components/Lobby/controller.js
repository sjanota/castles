export function createController(lobby, socket) {
  const channel = socket.channel("lobby:public");
  channel.join()
    .receive("ok", resp => {
      console.log("Successful join", resp)
    })
    .receive("error", resp => {
      console.log("Unable to join", resp);
      lobby.onComunicationError(resp.reason);
    });
}
