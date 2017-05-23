import React from 'react'
import { Field, Error, UserInput } from '../Common'
import { rgbHexToDec, rgbDecToHex, gradientColor, randomColor } from '../../util'

export class Login extends React.Component {
  constructor(props) {
    super();
    this.setError = this.setError.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.onColorChange = this.onColorChange.bind(this);
    this.onRandomColor = this.onRandomColor.bind(this);
    this.onLogin = this.onLogin.bind(this);
    this.state = {
      error: props.error,
      debug: true,
      name: '',
      color: '#ffffff'
    };
  }

  render() {
    const styles = {
      background: gradientColor(this.state.color, 'left'),
    }
    return (
      <div className="login" style={styles}>
        <h3>Login</h3>
        <div>
          <p>
            Welcome My Lord, in the realm of Castles! Pleasem give us more
            information about Your Majesty.
          </p>
          <div>
            {this.state.error ? <p className="error">Error: {this.state.error}</p> : ""}
            <p>
              Name: <input
                value={this.state.name}
                onChange={this.onNameChange}
              />
            </p>
            <p>
              Color: <input
                type="color"
                onChange={this.onColorChange}
                value={this.state.color}
              />
              <button
                style={{'marginLeft': '20px'}}
                className="small"
                onClick={this.onRandomColor}
              >Random</button>
            </p>
          </div>
        </div>
        <button onClick={this.onLogin}>Login</button>
      </div>
    );
  }

  onNameChange(e) {
    this.setState({name: e.target.value})
  }

  onColorChange(e) {
    this.setState({color: e.target.value})
  }

  onRandomColor() {
    let color = [255,255,255];
    while (color.every(i => i === 255)) {
      color = randomColor();
    }
    this.setState({color: rgbDecToHex(color)});
  }

  setError(err) {
    this.setState({error: err})
  }

  onLogin() {
    if (this.state.name === '') {
      this.setError("Provide name, My Lord.");
    } else if (this.state.color === '#ffffff') {
      this.setError("Choose your color, My Lord.");
    }
    this.props.onLogin({name: this.state.name, color: this.state.color})
  }

}
