import React from 'react'
import { Field, Error, UserInput } from '../Common'
import { Debug } from './debug'

export class Login extends React.Component {
  constructor() {
    super();
    this.setError = this.setError.bind(this)
    this.state = {
      error: '',
      debug: false
    }
  }

  render() {
    return (
      <div className="login">
        <h3>Login</h3>
        {this.state.debug ? this.debug() : ''}

        <p>
          <UserInput
            name="Login"
          />
          {this.state.error ? <Error value={this.state.error}/> : ''}
        </p>
        <button>Login</button>
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
