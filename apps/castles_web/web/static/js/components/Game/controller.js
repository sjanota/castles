import React from 'react'
import {Socket} from "phoenix"

export function startGame(game, myPlayer) {
  const socket =  new Socket("/game", {params: {
    name: myPlayer.name,
    color: myPlayer.color
  }});
  socket.connect();
  const channel = socket.channel("game:public", {});
  channel.on("game:prepare", payload => {
    console.log("Prepare!", payload.me, payload.opponent)
    game.setPlayers(payload.me, payload.opponent);
    game.nextController(new PrepareDefences(game, channel));
  });
  channel.on("game:your-turn", payload => {
    console.log("My turn!", payload.me, payload.opponent)
    game.setPlayers(payload.me, payload.opponent);
    game.nextController(new MyTurn(game, channel));
  });
  channel.on("game:opponent-turn", payload => {
    console.log("His turn!", payload.me, payload.opponent)
    game.setPlayers(payload.me, payload.opponent);
    game.nextController(new OpponentTurn(game, channel));
  });
  channel.join()
    .receive("ok", resp => {
      console.log("Successful join", resp)
    })
    .receive("error", resp => {
      console.log("Unable to join", resp);
      game.nextController(new GameError(game));
    });
  return new WaitForPrepare();
}

function Controls(props) {
  return (
    <div className="controls">
      {props.children}
    </div>
  );
}

class GameController {
  isDefensiveEditable() { return false; }
  isOffensiveEditable() { return false; }
  isOffensiveShown() { return false; }
  getStatus() {}
  renderControlls() { return <Controls/>; }
}

class WaitForPrepare extends GameController {
  getStatus() {
    return "Waiting for opponent"
  }
}

class PrepareDefences extends GameController {
  constructor(game, channel) {
    super();
    this.onCommit = this.onCommit.bind(this);
    this.renderControlls = this.renderControlls.bind(this);
    this.game = game;
    this.channel = channel;
  }

  isDefensiveEditable() { return true; }

  getStatus(state) {
    return "Choose your defence";
  }
  renderControlls(state) {
    return  (
      <Controls>
        <button
          onClick={() => this.onCommit(state)}
          disabled={!this.isCommitPossible(state)}
        >Apply defensives</button>
      </Controls>
    );
  }

  // PRIVATE
  isCommitPossible(state) {
    return state.myPlayer.defensive.every((it) => it.type !== "empty");
  }

  onCommit(state) {
    this.game.nextController(new WaitForStart());
    this.channel.push("player:prepared", state.myPlayer.defensive);
  }
}

class WaitForStart extends GameController {
  getStatus(state) {
    return `Waiting for ${state.opponentPlayer.name} to choose defence`;
  }
}

class MyTurn extends GameController {
  constructor(game, channel) {
    super();
    this.onCommit = this.onAttack.bind(this);
    this.renderControlls = this.renderControlls.bind(this);
    this.game = game;
    this.channel = channel;
  }

  isDefensiveEditable() {
    return false;
  }
  isOffensiveEditable() {
    return true;
  }
  isOffensiveShown() {
    return true;
  }
  getStatus(state) {
    return `Your turn - choose attack forces`
  }
  renderControlls(state) {
    return  (
      <Controls>
        <button
          onClick={this.onAttack}
          disabled={!this.isAttackPossible(state)}
        >Attack!</button>
      </Controls>
    );
  }

  // PRIVATE

  onAttack() {

  }

  isAttackPossible(state) {
    return state.myPlayer.offensive.every((it) => it.type !== "empty")
  }
}

class OpponentTurn extends GameController {
  getStatus(state) {
    return `Waiting for ${state.opponentPlayer.name} to attack`
  }
}
