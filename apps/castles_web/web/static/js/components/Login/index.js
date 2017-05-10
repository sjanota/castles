import React from 'react'
import { Field, Error, UserInput } from '../Common'
import { Debug } from './debug'

export class Login extends React.Component {
  constructor() {
    super();
    this.setError = this.setError.bind(this)
    this.handleLoginChange = this.handleLoginChange.bind(this)
    this.state = {
      error: '',
      debug: true,
      login: ''
    }
  }

  render() {
    return (
      <div className="login">
        <h3>Login</h3>
        {this.state.debug ? this.debug() : ''}

        <p>
          Login: <input value={this.state.login} onChange={this.handleLoginChange} />
          {this.state.error ? <Error value={this.state.error}/> : ''}
        </p>
        <button>Login</button>
      </div>
    );
  }

  handleLoginChange(e) {
    this.setState({login: e.target.value})
  }

  setError(err) {
    this.setState({error: err})
  }

  debug() {
    const toggleError = () => {
      if(this.state.error) {
        this.setError(null)
      } else {
        this.setError("artificial error")
      }
    }
    return (
      <Debug>
        <p><button onClick={toggleError}>Toggle error</button></p>
        <p><Field name="User name" value={this.state.login} /></p>
      </Debug>
    );
  }

}
