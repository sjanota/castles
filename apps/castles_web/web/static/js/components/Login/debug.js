import React from 'react'

export class Debug extends React.Component {
  constructor() {
    super();
    this.toggleError = this.toggleError.bind(this)
  }
  render() {
    return (
      <div>
        <button onClick={this.toggleError}>Toggle error</button>
      </div>
    );
  }

  toggleError() {
    if(this.props.error) {
      this.props.setError(null)
    } else {
      this.props.setError("artificial error")
    }
  }
}
