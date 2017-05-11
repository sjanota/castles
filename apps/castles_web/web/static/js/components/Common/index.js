import React from 'react'

export function Field(props) {
  return (
    <span className="field"><span className="name">{props.name}</span>: <span className="value">{props.value}</span></span>
  );
}

export function Error(props) {
  return (
    <span className="error"><Field name="Error" value={props.value}/></span>
  );
}

export function ErrorP(props) {
  return (
    <p><Error value={props.value} /></p>
  );
}

export function UserInput(props) {
  return (
    <span className="input"><span className="name">{props.name}:</span> <input className="value" onChange={props.onChange}>{props.value}</input></span>
  );
}

export class Debug extends React.Component {
  constructor() {
    super();
    this.toggleShow = this.toggleShow.bind(this)
    this.state = {
      show: true
    }
  }
  render() {
    const arrow = this.state.show ? '&uarr;' : '&darr;';
    return (
      <div className="debug">
        <h4>Debug <button onClick={this.toggleShow}  dangerouslySetInnerHTML={{__html: arrow}} /></h4>
        <div>
          {this.state.show ? this.props.children : ''}
        </div>
      </div>
    );
  }

  toggleShow() {
    this.setState(function (prev) {
      return {show: !prev.show}
    });
  }
}
