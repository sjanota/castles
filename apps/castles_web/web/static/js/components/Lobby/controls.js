import React from 'react'

export class Controls extends React.Component {
  render() {
    return (
      <div>
        <h4>Controls:</h4>
        <button onClick={this.props.challenge}>Challenge!</button>
      </div>
    );
  }
}
