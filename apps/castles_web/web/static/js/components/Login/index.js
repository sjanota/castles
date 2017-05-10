import React from 'react'
import { Field, ErrorP } from '../Common'

class Debug extends React.Component {
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

export class Login extends React.Component {
  constructor() {
    super();
    this.setError = this.setError.bind(this)
    this.state = {
      error: 'aaa',
      debug: true
    }
  }

  render() {
    return (
      <div className="login">
        <h3>Login</h3>
        {this.state.debug ? this.debug() : ''}
        {this.state.error ? <ErrorP value={this.state.error}/> : ''}
      </div>
    );
  }

  debug() {
    return <Debug
      setError={this.setError}
      error={this.state.error}
    />
  }

  setError(err) {
    this.setState({error: err})
  }
}
