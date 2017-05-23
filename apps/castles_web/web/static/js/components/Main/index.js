import React from 'react'
import { Login } from '../Login'
import { Lobby } from '../Lobby'
import { Game } from '../Game'
import { capitalize } from '../../util'
import { Socket } from "phoenix"

export class Main extends React.Component {
  constructor() {
    super();
    this.onLogin = this.onLogin.bind(this);
    this.onLogout = this.onLogout.bind(this);
    this.state = {
      error: null,
      playerData: null,
      isGameInProgress: false,
      socket: null
    };
  }

  render() {
    return (
      <div>
        <h2>Castles!</h2>
        {this.getCurrentPage()}
      </div>
    );
  }

  getCurrentPage() {
    if (!this.state.playerData) {
      return this.pageLogin();
    } else if (!this.state.isGameInProgress) {
      return this.pageLobby()
    } else {
      return this.pageGame();
    }
  }

  onLogin(playerData) {
    const socket = this.connect(playerData);
    this.setState({
      playerData: playerData,
      socket: socket
    });
  }

  onLogout(reason) {
    this.state.socket.disconnect();
    this.setState({
      error: reason,
      playerData: null,
      socket: null
    });
  }

  pageLogin() {
    return (
      <Login
        error={this.state.error}
        onLogin={this.onLogin}
      />
    );
  }

  pageLobby() {
    return (
      <Lobby
        playerData={this.state.playerData}
        socket={this.state.socket}
        onLogout={this.onLogout}
      />
    );
  }

  pageGame() {
    return (
      <Game
        playerData={this.state.playerData}
        socket={this.state.socket}
      />
    );
  }

  connect(playerData) {
    const socket =  new Socket("/game", {params: {
      name: playerData.name,
      color: playerData.color
    }});
    socket.connect();
    return socket;
  }

}
