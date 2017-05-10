import React from 'react'

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
