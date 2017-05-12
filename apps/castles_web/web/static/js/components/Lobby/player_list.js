import React from 'react'

export class PlayerList extends React.Component {
  render() {
    return (
      <div>
        <h4>Opponents:</h4>
        <ul className="scrollable-list player-list">
          {this.props.players.map((player, i) => {
            return <li
              key={player.name}
              onClick={() => this.props.setActivePlayer(i)}
              className={i === this.props.activePlayerNo ? "active" : ""}
            >{player.name}</li>
          })}
        </ul>
      </div>
    );
  }
}
