import React from 'react'
import { Debug } from '../Common'
import { capitalize } from '../../util'
import classNames from 'classnames'
import { startGame } from './controller'

const initArmy = Array(5).fill(makeUnit("empty"));
function makeUnit(type, alive) {
  alive = alive !== false ? true : false
  return {type: type, alive: alive}
}
const player1 = {
  name: 'Karo',
  defence: initArmy,
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
      <p>{props.message}</p>
    </div>
  );
}

function Unit(props) {
  const capitalizedUnit = capitalize(props.unit.type);
  const unitClasses = classNames('unit', {
    'no-mirror': props.unit.type === "unknown",
    dead: !props.unit.alive,
    alive: props.unit.alive
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

class BaseMain extends React.Component {
  constructor() {
    super();
    this.onUnitClick = this.onUnitClick.bind(this);
  }

  render() {
    return (
      <div className="my-container main">
        <Army
          units={this.props.player.defence}
          isShown={true}
          isEditable={this.props.isDefenceEditable}
          onUnitClick={(unit, i) =>
            this.onUnitClick('defence', this.props.isDefenceEditable, unit, i)
          }
        />
        <BaseCastle/>
        <Army
          units={this.props.player.offence}
          isShown={this.props.isOffenceShown}
          isEditable={this.props.isOffenceEditable}
          onUnitClick={(unit, i) =>
            this.onUnitClick('offence', this.props.isOffenceEditable, unit, i)
          }
        />
      </div>
    );
  }

  onUnitClick(army, isEditable, unit, i ) {
    if (isEditable) {
      this.props.onUnitClick(army, unit, i)
    }
  }
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
    this.nextController = this.nextController.bind(this);
    this.state = {
      myPlayer: player1,
      opponentPlayer: player2,
      myTurn: true,
      unitPickerActive: false,
      selectedSlot: null,
      controller: startGame(this)
    };
  };

  render() {
    return (
      <div className="game">
        <h3>Game</h3>
        <GameStatus
          message={this.state.controller.getStatus(this.state)}
        />
        {this.state.controller.renderControlls(this.state)}
        <div className="board my-container">
          <Base
            player={this.state.myPlayer}
            title="You"
            side="left"
            isDefenceEditable={this.state.controller.isDefenceEditable()}
            isOffenceEditable={this.state.controller.isOffenceEditable()}
            isOffenceShown={this.state.controller.isOffenceShown()}
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

  onSlotSelected(army, unit, i) {
    this.setState({selectedSlot: {army: army, number: i}});
  };

  onUnitSelected(unit, i) {
    this.setState((state) => {
      const player = Object.assign({}, state.myPlayer);
      const armyName = state.selectedSlot.army
      const army = player[armyName].slice();
      army[state.selectedSlot.number] = unit;
      player[armyName] = army;
      return {
        selectedSlot: null,
        myPlayer: player
      }
    });
  };

  nextController(controller) {
    this.setState({controller: controller});
  }
};
