import React from 'react'
import { Debug } from '../Common'
import { capitalize } from '../../util'
import classNames from 'classnames'
import { startGame } from './controller'

const initArmy = Array(5).fill(makeUnit("empty"));
function makeUnit(type, alive) {
  alive = alive !== false ? true : false
  return {type: type, alive: alive}
};

function randomColor() {
  function number() {
    return Math.floor(Math.random() * 256)
  }
  return `${number()},${number()},${number()}`
}

const player1 = {
  name: Math.random().toString(36).substr(2, 10),
  defensive: initArmy,
  offensive: initArmy,
  color: randomColor()
};

const nullPlayer = {
  name: '',
  defensive: initArmy,
  offensive: initArmy,
  color: "0,0,0",
  hidden: true
};

function gradientColor(color, side) {
  const rgb = `rgba(${color},`;
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
  return `rgb(${color})`
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
    'mirror': props.unit.type !== "unknown",
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
  const classes = classNames('unit-picker', 'hiddable', {
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
        <span>Defensive</span><span>Attack</span>
      </div>
    </div>
  );
}

function BaseCastle(props) {
  return (
    <div>
      <img src="images/castle-vertical.png" className="castle mirror"/>
    </div>
  );
}

function Waiting(props) {
  const classes = classNames('center', props.classes)
  return (
    <img
      src="images/ajax-loader.gif"
      className={classes}
    />
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
          units={this.props.player.defensive}
          isShown={true}
          isEditable={this.props.isDefensiveEditable}
          onUnitClick={(unit, i) =>
            this.onUnitClick('defensive', this.props.isDefensiveEditable, unit, i)
          }
        />
        <BaseCastle/>
        <Army
          units={this.props.player.offensive}
          isShown={this.props.isOffensiveShown}
          isEditable={this.props.isOffensiveEditable}
          onUnitClick={(unit, i) =>
            this.onUnitClick('offensive', this.props.isOffensiveEditable, unit, i)
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
  const baseClasses = classNames('player-base', 'hiddable', 'centerable', props.side, {
    'not-shown': props.player.hidden
  });
  let styles = {};
  if (!props.player.hidden) {
    styles.background = gradientColor(props.player.color, props.side);
  }
  return (
    <div className={baseClasses} style={styles}>
      <BaseHeader
        player={props.player}
        title={props.title}
      />
      <BaseMain
        player={props.player}
        isDefensiveEditable={props.isDefensiveEditable}
        isOffensiveEditable={props.isOffensiveEditable}
        isOffensiveShown={props.isOffensiveShown}
        onUnitClick={props.onUnitClick}
      />
      {props.player.hidden ? <Waiting classes="shown"/> : ""}
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
      opponentPlayer: nullPlayer,
      myTurn: true,
      unitPickerActive: false,
      selectedSlot: null,
      controller: startGame(this, player1)
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
            isDefensiveEditable={this.state.controller.isDefensiveEditable()}
            isOffensiveEditable={this.state.controller.isOffensiveEditable()}
            isOffensiveShown={this.state.controller.isOffensiveShown()}
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
            isDefensiveEditable={false}
            isOffensiveEditable={false}
            isOffensiveShown={true}
            onUnitClick={() => {}}
          />
        </div>
      </div>
    );
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

  setPlayers(myPlayer, opponentPlayer) {
    let toSet = {};
    if (myPlayer) {
      toSet.myPlayer = myPlayer;
    }
    if (opponentPlayer) {
      toSet.opponentPlayer = opponentPlayer;
    }
    this.setState(toSet);
  }
};
