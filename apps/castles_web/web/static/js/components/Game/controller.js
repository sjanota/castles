import React from 'react'
import {Socket} from "phoenix"

const initArmy = Array(5).fill(makeUnit("empty"));
function makeUnit(type, alive) {
  alive = alive !== false ? true : false
  return {type: type, alive: alive}
};

const nullPlayer = {
  name: '',
  defensive: initArmy,
  offensive: initArmy,
  color: "0,0,0",
  hidden: true
};

export const allUnits = ["archer", "axeman", "knight", "ninja", "shieldbearer", "swordsman", "viking"].map(makeUnit);

export function startGame(game, playerData) {
  const myPlayer = Object.assign({
    offensive: initArmy.slice(),
    defensive: initArmy.slice()
  }, playerData)
  const socket =  new Socket("/game", {params: {
    name: myPlayer.name,
    color: myPlayer.color
  }});
  socket.connect();
  const channel = socket.channel("game:public", {});
  channel.on("game:prepare", payload => {
    console.log("Prepare!", payload.me, payload.opponent)
    // payload.me.defensive = Array(5).fill({type: "archer", alive: true})
    game.setPlayers(payload.me, payload.opponent);
    game.nextController(new PrepareDefences(game, channel));
  });
  channel.on("game:your-turn", payload => {
    console.log("My turn!", payload.me, payload.opponent)
    // payload.me.offensive = Array(5).fill({type: "swordsman", alive: true})
    game.setPlayers(payload.me, payload.opponent);
    game.nextController(new MyTurn(game, channel));
  });
  channel.on("game:opponent-turn", payload => {
    console.log("His turn!", payload.me, payload.opponent)
    game.setPlayers(payload.me, payload.opponent);
    game.nextController(new OpponentTurn(game, channel));
  });
  channel.on("game:win", payload => {
    console.log("I won!", payload.me, payload.opponent)
    game.setPlayers(payload.me, payload.opponent);
    game.nextController(new Win(game));
    socket.disconnect();
  });
  channel.on("game:lost", payload => {
    console.log("I lost!", payload.me, payload.opponent)
    game.setPlayers(payload.me, payload.opponent);
    game.nextController(new Lost(game));
    socket.disconnect();
  });
  channel.join()
    .receive("ok", resp => {
      console.log("Successful join", resp)
    })
    .receive("error", resp => {
      console.log("Unable to join", resp);
      game.nextController(new GameError(game));
    });
  return [new WaitForPrepare(), myPlayer, nullPlayer];
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
        >Apply defensive</button>
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
    this.onAttack = this.onAttack.bind(this);
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
    return `Your turn - choose attack forces`;
  }
  renderControlls(state) {
    return  (
      <Controls>
        <button
          onClick={() => this.onAttack(state)}
          disabled={!this.isAttackPossible(state)}
        >Attack!</button>
      </Controls>
    );
  }

  // PRIVATE

  onAttack(state) {
    this.channel.push("player:attack", state.myPlayer.offensive);
  }

  isAttackPossible(state) {
    return state.myPlayer.offensive.every((it) => it.type !== "empty");
  }
}

class OpponentTurn extends GameController {
  getStatus(state) {
    return `Waiting for ${state.opponentPlayer.name} to attack`;
  }
}

class GameEnd extends GameController {
  constructor(game) {
    super();
    this.game = game;
    this.onNewGame = this.onNewGame.bind(this);
    this.renderControlls = this.renderControlls.bind(this);
  }

  renderControlls(state) {
    return (
      <Controls>
        <button
          onClick={() => this.onNewGame(state)}
        >New game</button>
      </Controls>
    );
  }

  onNewGame(state) {
    const playerData = {
      name: state.myPlayer.name,
      color: state.myPlayer.color
    };
    let [controller, myPlayer, opponentPlayer] = startGame(this.game, playerData);
    this.game.setPlayers(myPlayer, opponentPlayer);
    this.game.nextController(controller);
  }
}

class Win extends GameEnd {
  constructor(game) {
    super(game);
  }

  getStatus(state) {
    return "You won, My Lord!";
  }
}

class Lost extends GameEnd {
  constructor(game) {
    super(game);
  }

  getStatus(state) {
    return "You lost, My Lord!";
  }
}
