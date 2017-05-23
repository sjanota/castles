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
    this.onGameStarted = this.onGameStarted.bind(this);
    this.showDialog = this.showDialog.bind(this);
    this.hideDialog = this.hideDialog.bind(this);
    this.state = {
      error: null,
      playerData: null,
      gameId: null,
      socket: null,
      dialog: null
    };
  }

  render() {
    return (
      <div>
        <h2>Castles!</h2>
        {this.getCurrentPage()}
        {this.state.dialog ? this.state.dialog : ""}
      </div>
    );
  }

  getCurrentPage() {
    if (!this.state.playerData) {
      return this.pageLogin();
    } else if (!this.state.gameId) {
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

  onGameStarted(gameId) {
    this.setState({
      gameId: gameId
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
        showDialog={this.showDialog}
        hideDialog={this.hideDialog}
        onGameStarted={this.onGameStarted}
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

  showDialog(dialogContent) {
    const dialog = (
      <div className="dialog">
        <div className="overlay centerable">
          <div className="box center">
            {dialogContent}
          </div>
        </div>
      </div>
    );
    this.setState({dialog: dialog});
  }

  hideDialog() {
    this.setState({dialog: null});
  }

}
