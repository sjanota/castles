import React from 'react'
import { Debug } from '../Common'
import { capitalize } from '../../util'
import classNames from 'classnames'
import { startGame, allUnits, allUnitTypes } from './controller'

function randomColor() {
  function number() {
    return Math.floor(Math.random() * 256)
  }
  return `${number()},${number()},${number()}`
}

const player1 = {
  // name: Math.random().toString(36).substr(2, 10),
  name: prompt("Your name, My Lord:"),
  color: randomColor()
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

function getNextUnit(unit, distance) {
  const myI = allUnitTypes.indexOf(unit);
  const normalize = i => allUnitTypes[(myI + i) % allUnitTypes.length].toUpperCase();
  return normalize(distance)
}

function iKill(unit) {
  return getNextUnit(unit, 1);
}

function killsMe(unit) {
  return [2, 3].map(i => getNextUnit(unit, i))
}

function UnitLegend(props) {
  const classes = classNames({highlight: props.hoveredUnit === props.type});
  return (
    <tr
      className={classes}
      onMouseEnter={() => props.onHover(props.type)}
      onMouseLeave={() => props.onHover(null)}
    >
      <th>{props.type.toUpperCase()}</th>
      <th>{killsMe(props.type).map(u => <span>{u}</span>)}</th>
      <th>{iKill(props.type)}</th>
    </tr>
  );
}

function GameStatus(props) {
  return (
    <div className="status">
      <table className="legend">
        <tbody>
          <tr className="header">
            <th>Attacker</th>
            <th>Killed by</th>
            <th>Kills</th>
          </tr>
        </tbody>
        {allUnitTypes.map(type => <tbody key={type}><UnitLegend
          type={type}
          hoveredUnit={props.hoveredUnit}
          onHover={props.onUnitHover}
        /></tbody>)}
      </table>
      <p>{props.message}</p>
    </div>
  );
}

function Unit(props) {
  const capitalizedUnit = capitalize(props.unit.type);
  const unitClasses = classNames('unit', {
    'mirror': props.unit.type !== "unknown",
    dead: !props.unit.alive,
    alive: props.unit.alive,
    selected: props.isSelected
  });
  return (
    <div className={unitClasses}>
      <img
        onClick={props.onClick}
        width="50"
        height="50"
        src={"images/" + props.unit.type + ".png"}
        alt={capitalizedUnit}
        title={`${capitalizedUnit}\nKills: ${iKill(props.unit.type)}\nKilled by: ${killsMe(props.unit.type)}`}
        onMouseEnter={() => props.onHover(props.unit.type)}
        onMouseLeave={() => props.onHover(null)}
      />
      {!props.unit.alive ? <p className="killed-overlay"></p> : ""}
    </div>
  );
}

function Army(props) {
  const armyClasses = classNames('army', 'my-column', {
    'not-shown': !props.isShown,
    editable: props.isEditable,
    selected: props.isSelected
  });
  return (
    <div className={armyClasses}>
      {props.units.map((unit, i) =>
        <Unit key={i}
          isSelected={props.selectedUnit === i}
          unit={unit}
          onClick={() => props.onUnitClick(unit, i)}
          onHover={props.onUnitHover}
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
        onUnitHover={props.onUnitHover}
        isSelected={false}
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
          onUnitHover={this.props.onUnitHover}
          isSelected={this.props.selectedArmy === 'defensive'}
          selectedUnit={this.props.selectedUnit}
        />
        <BaseCastle/>
        <Army
          units={this.props.player.offensive}
          isShown={this.props.isOffensiveShown}
          isEditable={this.props.isOffensiveEditable}
          onUnitClick={(unit, i) =>
            this.onUnitClick('offensive', this.props.isOffensiveEditable, unit, i)
          }
          onUnitHover={this.props.onUnitHover}
          isSelected={this.props.selectedArmy === 'offensive'}
          selectedUnit={this.props.selectedUnit}
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
        onUnitHover={props.onUnitHover}
        selectedArmy={props.selectedArmy}
        selectedUnit={props.selectedUnit}
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
    this.onUnitHover = this.onUnitHover.bind(this);
    let [controller, myPlayer, opponentPlayer] = startGame(this, player1)
    this.state = {
      myPlayer: myPlayer,
      opponentPlayer: opponentPlayer,
      myTurn: true,
      unitPickerActive: false,
      selectedSlot: {army: null, unit: null},
      hoveredUnit: null,
      controller: controller
    };
  };

  render() {
    return (
      <div className="game">
        <h3>Game</h3>
        <GameStatus
          message={this.state.controller.getStatus(this.state)}
          hoveredUnit={this.state.hoveredUnit}
          onUnitHover={this.onUnitHover}
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
            onUnitHover={this.onUnitHover}
            selectedArmy={this.state.selectedSlot.army}
            selectedUnit={this.state.selectedSlot.number}
          />
          <UnitPicker
            isShown={this.state.selectedSlot.number != null}
            onUnitClick={this.onUnitSelected}
            onUnitHover={this.onUnitHover}
          />
          <Base
            player={this.state.opponentPlayer}
            title="Opponent"
            side="right"
            isDefensiveEditable={false}
            isOffensiveEditable={false}
            isOffensiveShown={true}
            onUnitClick={() => {}}
            onUnitHover={this.onUnitHover}
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
        selectedSlot: {army: null, unit: null},
        myPlayer: player
      }
    });
  };

  onUnitHover(unit) {
    this.setState({hoveredUnit: unit});
  }

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
