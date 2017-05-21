import React from 'react'

export function startGame(game) {
  return new InitGame(game)
}

function Controls(props) {
  return (
    <div className="controls">
      {props.children}
    </div>
  );
}

class GameController {
  isDefenceEditable() {}
  isOffenceEditable() {}
  isOffenceShown() {}
  handleMessage() {}
  renderControlls() {}
}

class InitGame extends GameController {
  constructor(game) {
    super();
    this.onCommit = this.onCommit.bind(this);
    this.renderControlls = this.renderControlls.bind(this);
    this.game = game;
  }

  isDefenceEditable() {
    return true;
  }
  isOffenceEditable() {
    return false;
  }
  isOffenceShown() {
    return false;
  }
  renderControlls(state) {
    return  (
      <Controls>
        <button
          onClick={this.onCommit}
          disabled={!this.isCommitPossible(state)}
        >Apply defences</button>
      </Controls>
    );
  }

  // PRIVATE
  isCommitPossible(state) {
    return state.myPlayer.defence.every((it) => it.type !== "empty");
  }

  onCommit() {
    console.log(this);
    this.game.nextController(new MyTurn(this.game))
  }
}

class MyTurn extends GameController {
  constructor(game) {
    super();
    this.onCommit = this.onAttack.bind(this);
    this.renderControlls = this.renderControlls.bind(this);
    this.game = game;
  }

  isDefenceEditable() {
    return false;
  }
  isOffenceEditable() {
    return true;
  }
  isOffenceShown() {
    return true;
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
    return state.myPlayer.offence.every((it) => it.type !== "empty")
  }
}
