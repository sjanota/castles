import React from 'react'
import { Login } from '../Login'
import { Lobby } from '../Lobby'
import { Game } from '../Game'
import { capitalize } from '../../util'

const playerList = [
  {name: "aaa", points: 123},
  {name: "bbb", points: 312},
  {name: "ccc", points: 456},
  {name: "ddd", points: 5436},
  {name: "eee", points: 7663},
  {name: "fff", points: 542352},
  {name: "ggg", points: 643534},
  {name: "hhh", points: 4324325},
  {name: "zzz", points: 53442},
  {name: "xxx", points: 4324},
  {name: "yyy", points: 2342},
  {name: "vvv", points: 42342},
  {name: "rrr", points: 5435},
  {name: "uuu", points: 799876},
  {name: "iii", points: 543}
]

const pagesMap = {
  login: <Login/>,
  lobby: <Lobby players={playerList} login="L0g1n"/>,
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
      page: pages[2]
    }
  }

  render() {
    return (
      <div>
        <h2>Castles!</h2>
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
