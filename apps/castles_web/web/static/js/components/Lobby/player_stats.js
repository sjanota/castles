import React from 'react'

export class PlayerStats extends React.Component {
  render() {
    return (
      <div>
        <h4>Player: '{this.props.player.name}'</h4>
        <p>Points: {this.props.player.points}</p>
      </div>
    );
  }
}
