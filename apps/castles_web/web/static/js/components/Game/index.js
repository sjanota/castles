import React from 'react'
import { Debug } from '../Common'
import { capitalize } from '../../util'
import classNames from 'classnames'

const initArmy = Array(5).fill("empty");

const player1 = {
  name: 'Karo',
  defence:["archer", "axeman", "knight", "archer", "viking"],
  offence: initArmy,
  color: 'red'
};
const player2 = {
  name: 'CJ',
  defence: Array(5).fill("unknown"),
  offence: initArmy,
  color: 'blue'
};

const colors = {
  red: 'rgba(255,0,0,0.3)',
  blue: 'rgba(0,0,255,0.3)',
}

const allUnits = ["archer", "axeman", "knight", "ninja", "shieldbearer", "swordsman", "viking", "empty"];

class GameStatus extends React.Component {
  render() {
    return (
      <div className="status">
        <p>{this.props.activePlayer.name}'s turn</p>
      </div>
    );
  }
}

class Controls extends React.Component {
  render() {
    return (
      <div className="controls">
        <button
          onClick={this.props.onAttack}
          disabled={!this.props.isAttackPossible}
        >Attack!</button>
      </div>
    );
  };
}

class Unit extends React.Component {
  render() {
    const capitalizedUnit = capitalize(this.props.unit);
    const unitClasses = classNames('unit', {
      'no-mirror': this.props.unit === "unknown"
    });
    return (
      <div className={unitClasses}>
        <img
          onClick={this.props.onClick}
          width="50"
          height="50"
          src={"images/" + this.props.unit + ".png"}
          alt={capitalizedUnit}
          title={capitalizedUnit}
        />
      </div>
    )
  }
}

class Army extends React.Component {
  render() {
    const armyClasses = classNames('army', 'my-column', {
      'not-shown': !this.props.isShown,
      editable: this.props.isEditable
    });
    return (
      <div className={armyClasses}>
        {this.props.units.map((unit, i) =>
          <Unit key={i}
            unit={unit}
            onClick={() => this.props.onUnitClick(unit, i)}
          />
        )}
      </div>
    );
  }
}

class UnitPicker extends React.Component {
  render() {
    const classes = classNames('unit-picker', {
      'not-shown': !this.props.isShown
    });
    return (
      <div className={classes}>
        <p>Choose unit</p>
        <Army
          units={allUnits}
          isShown={this.props.isShown}
          isEditable={false}
          onUnitClick={this.props.onUnitClick}
        />
      </div>
    );
  }
}

function PlayerName(props) {
  return (
    <div className="name">
      <p className="align">{props.player.name}</p>
      <p className="align">({props.title})</p>
    </div>
  )
}

function BaseHeader(props) {
  return (
    <div className="header">
      <PlayerName
        player={props.player}
        title={props.title}
      />
      <div className="my-container">
        <span>Defence</span><span>Attack</span>
      </div>
    </div>
  );
}

function BaseCastle(props) {
  return (
    <div>
      <img src="images/castle-vertical.png" className="castle"/>
    </div>
  );
}

function BaseMain(props) {
  return (
    <div className="my-container main">
      <Army
        units={props.player.defence}
        isShown={true}
        isEditable={props.isDefenceEditable}
        onUnitClick={() => {}}
      />
      <BaseCastle/>
      <Army
        units={props.player.offence}
        isShown={props.isOffenceShown}
        isEditable={props.isOffenceEditable}
        onUnitClick={props.onUnitClick}
      />
    </div>
  );
}

function Base(props) {
  const baseClasses = classNames('player-base', props.side)
  return (
    <div className={baseClasses} style={{
      backgroundColor: colors[props.player.color]
    }}>
      <BaseHeader
        player={props.player}
        title={props.title}
      />
      <BaseMain
        player={props.player}
        isDefenceEditable={props.isDefenceEditable}
        isOffenceEditable={props.isOffenceEditable}
        isOffenceShown={props.isOffenceShown}
        onUnitClick={props.onUnitClick}
      />
    </div>
  );
}

export class Game extends React.Component {
  constructor() {
    super();
    this.switchActivePlayer = this.switchActivePlayer.bind(this);
    this.onSlotSelected = this.onSlotSelected.bind(this);
    this.onUnitSelected = this.onUnitSelected.bind(this);
    this.onAttack = this.onAttack.bind(this);
    this.state = {
      myPlayer: player1,
      opponentPlayer: player2,
      myTurn: true,
      unitPickerActive: false,
      selectedSlot: null
    };
  };

  render() {
    return (
      <div className="game">
        <h3>Game</h3>
        <GameStatus activePlayer={this.activePlayer()}/>
        <Controls
          isAttackPossible={this.isAttackPossible()}
          onAttack={this.onAttack}
        />
        <div className="board my-container">
          <Base
            player={this.state.myPlayer}
            title="You"
            side="left"
            isDefenceEditable={false}
            isOffenceEditable={this.state.myTurn}
            isOffenceShown={this.state.myTurn}
            onUnitClick={this.onSlotSelected}
          />
          <UnitPicker
            isShown={this.state.selectedSlot != null}
            onUnitClick={this.onUnitSelected}
          />
          <Base
            player={this.state.opponentPlayer}
            title="Opponent"
            side="right"
            isDefenceEditable={false}
            isOffenceEditable={false}
            isOffenceShown={true}
            onUnitClick={() => {}}
          />
        </div>
      </div>
    );
  };

  activePlayer() {
    return this.state.myTurn ? this.state.myPlayer : this.state.opponentPlayer;
  };

  switchActivePlayer() {
    this.setState((prev) => prev.myTurn = !prev.myTurn);
  };

  onSlotSelected(unit, i) {
    this.setState({selectedSlot: i});
  };

  onUnitSelected(unit, i) {
    const player = Object.assign({}, this.activePlayer());
    const offence = player.offence.slice();
    offence[this.state.selectedSlot] = unit;
    player.offence = offence;
    this.setActivePlayer(player)
    this.setState({selectedSlot: null})
  };

  setActivePlayer(player) {
    if (this.state.myTurn) {
      this.setState({myPlayer: player})
    } else {
      this.setState({opponentPlayer: player})
    }
  };

  isAttackPossible() {
    return this.state.myPlayer.offence.every((it) => it !== "empty")
  };

  onAttack() {

  };
};
