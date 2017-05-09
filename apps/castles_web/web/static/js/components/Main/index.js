import React from 'react'
import { Login } from '../Login'
import { Lobby } from '../Lobby'
import { Game } from '../Game'
import { capitalize } from '../../util'

const pagesMap = {
  login: <Login />,
  lobby: <Lobby />,
  game: <Game />
};
const pages = Object.keys(pagesMap)

class SwitchPage extends React.Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this)
  }

  render() {
    return (
      <div className="switch">
        Page: <select
          defaultValue={this.props.value}
          onChange={this.handleChange}
        >
          {this.props.values.map((e) => {
            return <option value={e} key={e}>{capitalize(e)}</option>
          })}
        </select>
      </div>
    );
  }

  handleChange(event) {
    this.props.setPage(event.target.value)
  }
}

export class Main extends React.Component {
  constructor() {
    super();
    this.setPage = this.setPage.bind(this)
    this.state = {
      page: pages[0]
    }
  }

  render() {
    return (
      <div>
        <h2>Hello World!</h2>
        <SwitchPage
          value={this.state.page}
          values={pages}
          setPage={this.setPage}
        />
        {pagesMap[this.state.page]}
      </div>
    );
  }

  setPage(page) {
    this.setState({page: page})
  }
}
