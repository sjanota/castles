import React from 'react'
import {createController} from './controller'
import {gradientColor} from '../../util'

function Controls(props) {
  return (
    <div>
      <h4>Controls:</h4>
      <button
        onClick={props.onChallenge}
        disabled={!props.selectedPlayer}
      >Challenge!</button>
    </div>
  );
}

function PlayerStats(props) {
  return (
    <div>
      {!props.player ? "" : <div>
        <h4>Player: '{props.player.name}'</h4>
        <p>Points: {props.player.points}</p>
      </div>}
    </div>
  );
}

function PlayerList(props) {
  return (
    <div>
      <h4>Opponents:</h4>
      <ul className="scrollable-list player-list">
        {Object.keys(props.players).map((playerName) => {
          const player = props.players[playerName];
          const styles = {
            background: gradientColor(player.color, 'left')
          };
          return <li
            key={player.name}
            onClick={() => props.onPlayerClick(player)}
            className={player === props.selectedPlayer ? "selected" : ""}
          ><div style={styles}>{player.name}</div></li>
        })}
      </ul>
    </div>
  );
}

function LoginLine(props) {
  return (
    <p>
      Logged as '{props.playerData.name}'
      <button
        onClick={props.onLogout}
        className="small"
        style={{marginLeft: '20px'}}
      >Logout</button>
    </p>
  );
}

export class Lobby extends React.Component {
  constructor(props) {
    super();
    this.onPlayerClick = this.onPlayerClick.bind(this);
    this.onChallenge = this.onChallenge.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.onChallengeAccepted = this.onChallengeAccepted.bind(this);
    this.onChallengeDeclined = this.onChallengeDeclined.bind(this);
    this.addPlayers = this.addPlayers.bind(this);
    this.removePlayers = this.removePlayers.bind(this);
    this.awaitChallengeRespnse = this.awaitChallengeRespnse.bind(this);
    this.state = {
      selectedPlayer: null,
      players: {},
      controller: createController(this, props.socket)
    };
  }

  render() {
    return (
      <div className="lobby">
        <h3>Lobby</h3>
        <LoginLine
          playerData={this.props.playerData}
          onLogout={this.onLogout}
        />
        <div className="my-container">
          <PlayerList
            players={this.state.players}
            selectedPlayer={this.state.selectedPlayer}
            onPlayerClick={this.onPlayerClick}
          />
          <PlayerStats
            player={this.state.selectedPlayer}
          />
          <Controls
            selectedPlayer={this.state.selectedPlayer}
            onChallenge={this.onChallenge}
          />
        </div>
      </div>
    );
  }

  onPlayerClick(selectedPlayer) {
    this.setState({selectedPlayer: selectedPlayer});
  }

  onComunicationError(reason) {
    this.state.controller.onLeave();
    this.props.onLogout(`Lobby communication error: ${reason}`)
  }

  onLogout() {
    this.state.controller.onLeave();
    this.props.onLogout();
  }

  onChallenge() {
    this.state.controller.beginChallenge(this.state);
  }

  addPlayers(newPlayers) {
    newPlayers = newPlayers.filter(p => p.name != this.props.playerData.name)
    this.setState(state => {
      const players = Object.assign({}, state.players);
      for (let player of newPlayers) {
        players[player.name] = player;
      };
      return {players: players};
    });
  }

  removePlayers(removePlayers) {
    this.setState(state => {
      const players = Object.assign({}, state.players);
      for (let player of removePlayers) {
        delete players[player.name];
      };
      return {players: players};
    });
  }

  awaitChallengeRespnse() {
    this.props.showDialog(<div className="my-column" style={{width: '300px'}}>
      <p>Awaiting response to challenge from '{this.state.selectedPlayer.name}'</p>
      <img className="centered" src="images/ajax-loader.gif"/>
    </div>);
  }

  onIncommingCallenge(challengedBy) {
    function accept() {
      this.props.showDialog(<div className="my-column" style={{width: '300px'}}>
        <p>Awaiting game data</p>
        <img className="centered" src="images/ajax-loader.gif"/>
      </div>)
      this.state.controller.acceptChallenge(challengedBy);
    }
    accept = accept.bind(this);

    function decline() {
      this.props.hideDialog()
      this.state.controller.declineChallenge(challengedBy);
    }
    decline = decline.bind(this);

    this.props.showDialog(<div className="my-column" style={{width: '300px'}}>
      <p>You are challenged by '{challengedBy}'!</p>
      <p>Would you like to accept the challenge?</p>
      <div>
        <button onClick={accept}>Accept</button>
        <button onClick={decline} style={{marginLeft: '20px'}}>Decline</button>
      </div>
    </div>)
  }

  onChallengeAccepted(challengedBy) {
    function ok() {
      this.props.hideDialog();
      let gameId = this.state.controller.startChallenge(this.props.playerData, challengedBy);
      this.state.controller.onLeave();
      this.props.onGameStarted(gameId);
    }
    ok = ok.bind(this);
    this.props.showDialog(<div className="my-column" style={{width: '300px'}}>
      <p>Challenge has been accepted!</p>
      <button className="centered" onClick={ok}>OK</button>
    </div>);
  }

  onChallengeDeclined() {
    function ok() {
      this.props.hideDialog();
    }
    ok = ok.bind(this);
    this.props.showDialog(<div className="my-column" style={{width: '300px'}}>
      <p>Challenge has been declined</p>
      <button className="centered" onClick={ok}>OK</button>
    </div>);
  }

  onChallengeStarted(gameId) {
    this.props.hideDialog();
    this.state.controller.onLeave();
    this.props.onGameStarted(gameId);
  }
}
