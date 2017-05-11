import React from 'react'
import { Debug } from '../Common'
import { PlayerList } from './player_list'

export class Lobby extends React.Component {
  constructor() {
    super();
    this.setActivePlayer = this.setActivePlayer.bind(this)
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
        <PlayerList
          players={this.props.players}
          activePlayerNo={this.state.activePlayer}
          setActivePlayer={this.setActivePlayer}
        />
        {/* <PlayerControl
          activePlayer={this.getActivePlayer()}
        /> */}
      </div>
    );
  }

  setActivePlayer(activePlayer) {
    this.setState({activePlayer: activePlayer})
  }

  getActivePlayer() {
    return this.props.players[this.state.activePlayer]
  }

  debug() {
    return (
      <Debug>
      </Debug>
    );
  }
}
