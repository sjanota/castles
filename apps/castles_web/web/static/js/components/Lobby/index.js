import React from 'react'
import { Debug } from '../Common'
import { PlayerList } from './player_list'
import { PlayerStats } from './player_stats'
import { Controls } from './controls'

export class Lobby extends React.Component {
  constructor() {
    super();
    this.setActivePlayer = this.setActivePlayer.bind(this)
    this.challengeActivePlayer = this.challengeActivePlayer.bind(this)
    this.state = {
      debug: true,
      activePlayer: 0
    }
  }

  render() {
    return (
      <div className="lobby">
        <h3>Lobby</h3>
        {this.state.debug ? this.debug() : ''}
        <h4>Logged as '{this.props.login}'</h4>
        <div className="container">
          <PlayerList
            players={this.props.players}
            activePlayerNo={this.state.activePlayer}
            setActivePlayer={this.setActivePlayer}
          />
          <PlayerStats
            player={this.getActivePlayer()}
          />
          <Controls
            challenge={this.challengeActivePlayer}
          />
        </div>
      </div>
    );
  }

  setActivePlayer(activePlayer) {
    this.setState({activePlayer: activePlayer})
  }

  getActivePlayer() {
    return this.props.players[this.state.activePlayer]
  }

  challengeActivePlayer() {

  }

  debug() {
    return (
      <Debug>
      </Debug>
    );
  }
}
