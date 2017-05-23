import React from 'react'
import { Debug } from '../Common'
import { capitalize, gradientColor, plainColor, randomColor } from '../../util'
import classNames from 'classnames'
import { startGame, allUnits, allUnitTypes } from './controller'

const player1 = {
  name: Math.random().toString(36).substr(2, 10),
  // name: prompt("Your name, My Lord:"),
  color: randomColor()
};

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
      <th>{killsMe(props.type).map(u => <span key={u}>{u}</span>)}</th>
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
    selected: props.isSelected,
    editable: props.isEditable
  });
  return (
    <div className={unitClasses}>
      <img
        width="50"
        height="50"
        src={"images/" + props.unit.type + ".png"}
        alt={capitalizedUnit}
        title={`${capitalizedUnit}\nKills: ${iKill(props.unit.type)}\nKilled by: ${killsMe(props.unit.type)}`}
        onClick={props.onClick}
        onMouseEnter={() => props.onHover(props.unit.type)}
        onMouseLeave={() => props.onHover(null)}
      />
      {!props.unit.alive ? <p
        className="killed-overlay"
        title={`${capitalizedUnit}\nKills: ${iKill(props.unit.type)}\nKilled by: ${killsMe(props.unit.type)}`}
        onClick={props.onClick}
        onMouseEnter={() => props.onHover(props.unit.type)}
        onMouseLeave={() => props.onHover(null)}
      /> : ""}
    </div>
  );
}

function Army(props) {
  const armyClasses = classNames('army', 'my-column', {
    'not-shown': !props.isShown,
    selected: props.isSelected
  });
  return (
    <div className={armyClasses}>
      {props.units.map((unit, i) =>
        <Unit key={i}
          unit={unit}
          isSelected={props.selectedUnit === i}
          isEditable={props.isEditable && props.isUnitEditable(i)}
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
    this.onDefensiveUnitClick = this.onDefensiveUnitClick.bind(this);
    this.onOffensiveUnitClick = this.onOffensiveUnitClick.bind(this);
  }

  render() {
    return (
      <div className="my-container main">
        <Army
          units={this.props.player.defensive}
          selectedUnit={this.props.selectedUnit}
          isShown={true}
          isEditable={this.props.isDefensiveEditable}
          isUnitEditable={() => true}
          isSelected={this.props.selectedArmy === 'defensive'}
          onUnitClick={this.onDefensiveUnitClick}
          onUnitHover={this.props.onUnitHover}

        />
        <BaseCastle/>
        <Army
          units={this.props.player.offensive}
          selectedUnit={this.props.selectedUnit}
          isShown={this.props.isOffensiveShown}
          isEditable={this.props.isOffensiveEditable}
          isUnitEditable={this.props.isUnitEditable}
          isSelected={this.props.selectedArmy === 'offensive'}
          onUnitClick={this.onOffensiveUnitClick}
          onUnitHover={this.props.onUnitHover}
        />
      </div>
    );
  }

  onDefensiveUnitClick(unit, i) {
    this.onUnitClick('defensive', this.props.isDefensiveEditable, unit, i)
  }

  onOffensiveUnitClick(unit, i) {
    if (this.props.isUnitEditable(i)) {
      this.onUnitClick('offensive', this.props.isOffensiveEditable, unit, i)
    }
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
        selectedArmy={props.selectedArmy}
        selectedUnit={props.selectedUnit}
        isDefensiveEditable={props.isDefensiveEditable}
        isOffensiveEditable={props.isOffensiveEditable}
        isOffensiveShown={props.isOffensiveShown}
        isUnitEditable={props.isUnitEditable}
        onUnitClick={props.onUnitClick}
        onUnitHover={props.onUnitHover}
      />
      {props.player.hidden ? <Waiting classes="shown"/> : ""}
    </div>
  );
}

export class Game extends React.Component {
  constructor(props) {
    super();
    this.switchActivePlayer = this.switchActivePlayer.bind(this);
    this.onSlotSelected = this.onSlotSelected.bind(this);
    this.onUnitSelected = this.onUnitSelected.bind(this);
    this.nextController = this.nextController.bind(this);
    this.onUnitHover = this.onUnitHover.bind(this);
    this.isUnitEditable = this.isUnitEditable.bind(this);
    let [controller, myPlayer, opponentPlayer] = startGame(this, props.socket, props.playerData)
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
            selectedArmy={this.state.selectedSlot.army}
            selectedUnit={this.state.selectedSlot.number}
            isDefensiveEditable={this.state.controller.isDefensiveEditable()}
            isOffensiveEditable={this.state.controller.isOffensiveEditable()}
            isOffensiveShown={this.state.controller.isOffensiveShown()}
            isUnitEditable={this.isUnitEditable}
            onUnitClick={this.onSlotSelected}
            onUnitHover={this.onUnitHover}
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

  isUnitEditable(i) {
    return this.state.opponentPlayer.defensive[i].alive
  }
};
