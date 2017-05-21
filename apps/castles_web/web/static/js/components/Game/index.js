import React from 'react'
import { Debug } from '../Common'
import { capitalize } from '../../util'
import classNames from 'classnames'

const initArmy = Array(5).fill(makeUnit("empty"));
function makeUnit(type, alive) {
  alive = alive !== false ? true : false
  return {type: type, alive: alive}
}
const player1 = {
  name: 'Karo',
  defence:[
    makeUnit("swordsman"),
    makeUnit("axeman"),
    makeUnit("knight", false),
    makeUnit("archer", false),
    makeUnit("viking")
  ],
  offence: initArmy,
  color: [178,118,65]
};
const player2 = {
  name: 'CJ',
  defence: Array(5).fill(makeUnit("unknown")),
  offence: initArmy,
  color: [0,128,128]
};

function gradientColor(color, side) {
  const rgb = `rgba(${color.join(',')},`;
  const parts = [
    '#ffffff',
    '#ffffff',
    `${rgb}0.6)`,
    `${rgb}1.0)`,
    `${rgb}1.0)`
  ];
  const angle = side === "left" ? '45deg' : '-45deg';
  return `linear-gradient(${angle},${parts.join(',')})`;
}

function plainColor(color, sied) {
  return `rgb(${color.join(',')})`
}

const allUnits = ["archer", "axeman", "knight", "ninja", "shieldbearer", "swordsman", "viking", "empty"].map(makeUnit);

function GameStatus(props) {
  return (
    <div className="status">
      <p>{props.activePlayer.name}'s turn</p>
    </div>
  );
}

function Controls(props) {
  return (
    <div className="controls">
      <button
        onClick={props.onAttack}
        disabled={!props.isAttackPossible}
      >Attack!</button>
    </div>
  );
}

function Unit(props) {
  const capitalizedUnit = capitalize(props.unit.type);
  const unitClasses = classNames('unit', {
    'no-mirror': props.unit.type === "unknown",
    dead: !props.unit.alive
  });
  return (
    <div className={unitClasses}>
      <img
        onClick={props.onClick}
        width="50"
        height="50"
        src={"images/" + props.unit.type + ".png"}
        alt={capitalizedUnit}
        title={capitalizedUnit}
      />
      {!props.unit.alive ? <p className="killed-overlay"></p> : ""}
    </div>
  );
}

function Army(props) {
  const armyClasses = classNames('army', 'my-column', {
    'not-shown': !props.isShown,
    editable: props.isEditable
  });
  return (
    <div className={armyClasses}>
      {props.units.map((unit, i) =>
        <Unit key={i}
          unit={unit}
          onClick={() => props.onUnitClick(unit, i)}
        />
      )}
    </div>
  );
};

function UnitPicker(props) {
  const classes = classNames('unit-picker', {
    'not-shown': !props.isShown
  });
  return (
    <div className={classes}>
      <p>Choose unit</p>
      <Army
        units={allUnits}
        isShown={props.isShown}
        isEditable={false}
        onUnitClick={props.onUnitClick}
      />
    </div>
  );
}

function PlayerName(props) {
  const styles = {color: plainColor(props.player.color)}
  return (
    <div className="name">
      <p className="align" style={styles}>{props.player.name}</p>
      <p className="align" style={styles}>({props.title})</p>
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
      background: gradientColor(props.player.color, props.side)
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
    this.setState((state) => {
      const player = Object.assign({}, state.myPlayer);
      const offence = player.offence.slice();
      offence[state.selectedSlot] = unit;
      player.offence = offence;
      return {
        selectedSlot: null,
        myPlayer: player
      }
    });
  };

  isAttackPossible() {
    return this.state.myPlayer.offence.every((it) => it !== "empty")
  };

  onAttack() {

  };
};
