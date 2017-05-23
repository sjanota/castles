import React from 'react'
import {createController} from './controller'

function Controls(props) {
  return (
    <div>
      <h4>Controls:</h4>
      <button
        onClick={props.challenge}
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
        {props.players.map((player) => {
          return <li
            key={player.name}
            onClick={() => props.onPlayerClick(player)}
            className={player === props.selectedPlayer ? "selected" : ""}
          >{player.name}</li>
        })}
      </ul>
    </div>
  );
}

export class Lobby extends React.Component {
  constructor(props) {
    super();
    this.onPlayerClick = this.onPlayerClick.bind(this);
    this.onChallenge = this.onChallenge.bind(this);
    this.state = {
      selectedPlayer: null,
      players: [],
      controller: createController(this, props.socket)
    };
  }

  render() {
    return (
      <div className="lobby">
        <h3>Lobby</h3>
        <p>Logged as '{this.props.playerData.name}'</p>
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
    this.props.onLogout(`Lobby communication error: ${reason}`)
  }

  onChallenge() {

  }
}
