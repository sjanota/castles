import {Presence} from 'phoenix'

function getMetas(playerMap) {
  return Object.keys(playerMap).map(k => playerMap[k].metas[0])
}

export function createController(lobby, socket) {
  const channel = socket.channel("lobby:public");
  const controller = new LobbyController(lobby, channel);
  channel.on("presence_diff", resp => {
    lobby.addPlayers(getMetas(resp.joins));
    lobby.removePlayers(getMetas(resp.leaves));
    controller.onPlayersLeft(resp.leaves);
  });
  channel.on("player:challenge:begin", resp => {
    console.log("accept", resp)
    controller.onChallengeBegin(resp.by)
  });
  channel.on("player:challenge:accept", resp => {
    console.log("accept", resp)
    controller.onChallengeAccepted(resp.by)
  });
  channel.on("player:challenge:decline", resp => {
    console.log("decline", resp)
    controller.onChallengeDeclined(resp.by)
  });
  channel.on("player:challenge:start", resp => {
    console.log("start", resp)
    controller.onChallengeStarted(resp.by, resp.game)
  });
  channel.join()
    .receive("ok", resp => {
      console.log("Successful join", resp)
      const players = getMetas(resp)
      lobby.addPlayers(players)
    })
    .receive("error", resp => {
      console.log("Unable to join", resp);
      lobby.onComunicationError(resp.reason);
    });
  return controller;
}

class LobbyController {
  constructor(lobby, channel) {
    this.onLeave = this.onLeave.bind(this);
    this.onChallengeBegin = this.onChallengeBegin.bind(this);
    this.onChallengeAccepted = this.onChallengeAccepted.bind(this);
    this.onChallengeDeclined = this.onChallengeDeclined.bind(this);
    this.onChallengeStarted = this.onChallengeStarted.bind(this);
    this.beginChallenge = this.beginChallenge.bind(this);
    this.acceptChallenge = this.acceptChallenge.bind(this);
    this.declineChallenge = this.declineChallenge.bind(this);
    this.startChallenge = this.startChallenge.bind(this);
    this.channel = channel;
    this.challengedPlayer = null;
    this.lobby = lobby;
  }

  onLeave() {
    this.channel.leave()
  }

  beginChallenge(state) {
    this.channel.push("player:challenge:begin", {target: state.selectedPlayer.name});
    this.challengedPlayer = state.selectedPlayer.name;
    this.lobby.awaitChallengeRespnse();
  }

  onPlayersLeft(leaves) {
    for (const name of Object.keys(leaves)) {
      this.onChallengeDeclined(name);
    }
  }

  acceptChallenge(challengedBy) {
    this.challengedPlayer = challengedBy;
    this.channel.push("player:challenge:accept", {target: challengedBy});
  }

  declineChallenge(challengedBy) {
    this.channel.push("player:challenge:decline", {target: challengedBy});
  }

  startChallenge(playerData, challengedBy) {
    this.channel.push("player:challenge:start", {target: challengedBy, game: playerData.name});
    return playerData.name;
  }

  onChallengeBegin(challengedBy) {
    if (this.challengedPlayer == null) {
      console.log('incommign challenge')
      this.lobby.onIncommingCallenge(challengedBy)
    } else {
      console.log('auto decline')
      this.declineChallenge(challengedBy)
    }
  }

  onChallengeAccepted(acceptedBy) {
    if (this.challengedPlayer === acceptedBy) {
      console.log('accept')
      this.challengedPlayer = null;
      this.lobby.onChallengeAccepted(acceptedBy);
    } else {
      console.log('skip accept')
    }
  }

  onChallengeDeclined(declinedBy) {
    if (this.challengedPlayer === declinedBy) {
      console.log('decline')
      this.challengedPlayer = null;
      this.lobby.onChallengeDeclined(declinedBy);
    } else {
      console.log('skip decline')
    }
  }

  onChallengeStarted(startedBy, gameId) {
    if (this.challengedPlayer === startedBy) {
      console.log('start')
      this.challengedPlayer = null;
      this.lobby.onChallengeStarted(gameId);
    } else {
      console.log('skip start')
    }
  }
}
