import React from 'react'

export class PlayerList extends React.Component {
  render() {
    return (
      <ul className="scrollable-list player-list">
        {this.props.players.map((player, i) => {
          return <li
            key={player.name}
            onClick={() => this.props.setActivePlayer(i)}
            className={i === this.props.activePlayerNo ? "active" : ""}
          >{player.name}</li>
        })}
      </ul>
    );
  }
}
