import React from 'react'
import { capitalize } from '../../util'

const player1 = {name: 'Karo', defence:["archer", "axeman", "knight", "archer", "viking"]}
const player2 = {name: 'CJ', defence: Array(5).fill("unknown")}

const activePlayer = player1.name;
const initArmy = Array(5).fill("empty");
const allUnits = ["archer", "axeman", "knight", "ninja", "shieldbearer", "swordsman", "viking"];

class GameStatus extends React.Component {
  render() {
    return (
      <div className="status">
        <p>{this.props.activePlayer}'s turn</p>
      </div>
    );
  }
}

class Army extends React.Component {
  render() {
    return (
      <div className={"army my-column" + (this.props.hidden ? " not-shown" : "")}>
        {this.props.units.map((unit, i) => {
          const capitalizedUnit = capitalize(unit);
          return (<div className={"unit " + (unit === "unknown" ? "no-mirror" : "")} key={i}>
            <img
              width="50"
              height="50"
              src={"images/" + unit + ".png"}
              alt={capitalizedUnit}
              title={capitalizedUnit}
            />
          </div>);
        })}
      </div>
    );
  }
}

class UnitPicker extends React.Component {
  render() {
    return (
      <div className={"unit-picker " + (this.props.isActive ? "" : "not-shown")}>
        <p>Choose unit</p>
        <Army units={allUnits} hidden={!this.props.isActive}/>
      </div>
    );
  }
}

class Base extends React.Component {
  render() {
    return (
      <div className={"player-base " + this.props.side}>
        <p className="align name">{this.props.player.name}</p>
        <div className="my-container">
          <span>Defence</span><span>Attack</span>
        </div>
        <div className="my-container">
          <Army units={this.props.player.defence}/>
          <div><img src="images/castle-vertical.png" className="castle"/></div>
          <Army units={initArmy} hidden={!this.props.myTurn}/>
        </div>
      </div>
    );
  }
}

export function Game(props) {
  return (
    <div className="game">
      <h3>Game</h3>
      <GameStatus activePlayer={activePlayer}/>
      <div className="board my-container">
        <Base player={player1} side="left" myTurn={player1.name === activePlayer}/>
        <UnitPicker isActive={true}/>
        <Base player={player2} side="right"  myTurn={player2.name === activePlayer}/>
      </div>
    </div>
  );
}
