defmodule CastlesGame.Game do
  use GenServer
  require Logger

  def start_link(game_id) do
    GenServer.start_link(__MODULE__, [game_id])
  end

  def connect(game, data) do
    GenServer.call(game, {:connect, data})
  end

  def player_defence_ready(game, defences) do
    GenServer.call(game, {:player_defence_ready, defences})
  end

  def player_attack(game, attack) do
    GenServer.call(game, {:player_attack, attack})
  end

  defmodule Unit do
    def empty do
      %{type: "empty", alive: true}
    end

    def unknown do
      %{type: "unknown", alive: true}
    end

    def parse(%{"type" => type, "alive" => alive}) do
      %{type: type, alive: alive}
    end
    def parse(unit) do
      unit
    end

    def set_alive(unit, alive) do
      Map.put(unit, :alive, alive)
    end
  end

  defmodule Player do
    def new(pid, player_data) do
      %{
        pid: pid,
        defence_ready: false,
        name: player_data.name,
        color: player_data.color,
        offensive: empty_army(5),
        defensive: empty_army(5)
      }
    end

    def show(player) do
      player
      |> Map.delete(:pid)
    end

    def hide(player) do
      player = show player
      if player.defence_ready do
        Map.put(player, :defensive, hidden_army(player.defensive))
      else
        player
      end
    end

    def set_defensive(player, defensive) do
      player
      |> Map.put(:defensive, parse_army(defensive))
      |> Map.put(:defence_ready, true)
    end

    def set_offensive(player, offensive) do
      player
      |> Map.put(:offensive, parse_army(offensive))
    end

    def clear_offensive(player) do
      offensive = Enum.map(player.offensive, fn u ->
        Unit.set_alive(u, true)
      end)
      Map.put(player, :offensive, offensive)
    end

    def notify(event, player, opponent) do
      %{pid: pid} = player
      event_data = %{
        me: show(player),
        opponent: hide(opponent)
      }
      Process.send pid, {:game, event, event_data}, []
    end

    def empty_army(size) do
      for _n <- 1..size, do: Unit.empty
    end

    defp hidden_army(army) do
      Enum.map army, fn unit -> if unit.alive do Unit.unknown else unit end end
    end

    def parse_army(army) do
      Enum.map(army, &Unit.parse/1)
    end

    def lost?(player) do
      Enum.all?(player.defensive, fn u -> !u.alive end)
    end
  end

  def init([game_id]) do
    Logger.info("start game " <> game_id)
    {:ok, %{
      id: game_id,
      players: []
    }}
  end

  def handle_call({:connect, player_data}, {pid, _tag}, %{players: players} = state)
  when length(players) < 2 do
    %{players: players} = state
    Process.send self(), :request_defences, []
    player = Player.new(pid, player_data)
    reply = {:ok, %{me: Player.show(player)}}
    state = Map.put(state, :players, [player | players])
    Process.monitor pid
    {:reply, reply, state}
  end

  def handle_call({:connect, _}, _from, state) do
    {:stop, {:error, :too_many_players}, state}
  end

  def handle_call({:player_defence_ready, defences}, {pid, _tag}, state) do
    state = update_player_by_pid(state, pid, fn player ->
      Player.set_defensive(player, defences)
    end)
    state = if all_players_defence_ready(state) do
       next_turn(state)
    else
       state
    end
    {:reply, :ok, state}
  end

  def handle_call({:player_attack, attack}, {pid, _tag}, %{players: [%{pid: pid} | _]} = state) do
    {:reply, :ok, state
      |> resolve_attack(Player.parse_army(attack))
      # |> clear_defender_offensive
      |> next_turn_or_game_end
    }
  end

  def handle_info(:request_defences, state) do
    %{players: players} = state
    if length(players) == 2 do
      Logger.info("ready to roll!")
      notify_players("game:prepare", state)
    end
    {:noreply, state}
  end

  def handle_info({:DOWN, _, :process, _, _}, state) do
    Logger.info "Player left the game"
    {:stop, :shutdown, state}
  end

  defp notify_players(event, state) do
    %{players: [p1, p2]} = state
    Player.notify(event, p1, p2)
    Player.notify(event, p2, p1)
  end

  defp update_player_by_pid(state, pid, callback) do
    players = update_player_by_pid_inner(state.players, pid, callback)
    Map.put(state, :players, players)
  end

  defp update_player_by_pid_inner([%{pid: pid1} = player | other], pid2, cb)
  when pid1 == pid2 do
    [apply(cb, [player]) | other]
  end

  defp update_player_by_pid_inner([p | other], pid, callback) do
    [p | update_player_by_pid_inner(other, pid, callback)]
  end

  defp next_turn_or_game_end(state) do
    [_, defender] = state.players
    if Player.lost?(defender) do
      game_end(state)
    else
      next_turn(state)
    end
  end

  defp next_turn(state) do
    [p2, p1] = state.players
    Player.notify("game:your-turn", p1, p2)
    Player.notify("game:opponent-turn", p2, p1)
    Map.put(state, :players, Enum.reverse(state.players))
  end

  defp all_players_defence_ready(state) do
    Enum.all?(state.players, fn p -> p.defence_ready end)
  end

  defp resolve_attack(state, attack) do
    [attacker, defender] = state.players
    {attackers, deffenders} = incomming_attack(attack, defender.defensive)
    defender = Player.set_defensive(defender, deffenders)
    attacker = Player.set_offensive(attacker, attackers)
    Logger.info "After attack: #{inspect defender} #{inspect attacker}"
    Map.put(state, :players, [attacker, defender])
  end

  defp incomming_attack(attack, defence) do
    List.zip([attack, defence])
    |> Enum.map(&clash_of_units/1)
    |> Enum.unzip
  end

  defp clash_of_units({attacker, %{alive: false} = defender}) do
    {attacker, defender}
  end

  defp clash_of_units({attacker, defender}) do
    defender_force = defender_force(attacker, defender)
    Logger.info "Clash #{attacker.type} -> #{defender.type}: #{defender_force}"
    {attacker_alive, defender_alive} = cond do
      # defender is killed
      defender_force == 1 -> {true, false}
      # attacker is killed
      # defender_force <= 3 -> {false, true}
      # paar
      true -> {true, true}
    end
    {
      Unit.set_alive(attacker, attacker_alive),
      Unit.set_alive(defender, defender_alive)
    }
  end

  defp defender_force(attacker, defender) do
    units = ["archer", "axeman", "knight", "ninja", "shieldbearer", "swordsman", "viking"]
    units = order_units(units, attacker.type, [])
    Enum.find_index(units, fn e -> e == defender.type end)
  end

  defp order_units([unit | _] = units, unit, acc) do
    units ++ Enum.reverse(acc)
  end
  defp order_units([other_unit | rest], unit, acc) do
    order_units(rest, unit, [other_unit | acc])
  end

  defp clear_defender_offensive(state) do
    [attacker, defender] = state.players
    defender = Player.clear_offensive(defender)
    Map.put(state, :players, [attacker, defender])
  end

  defp game_end(state) do
    [attacker, defender] = state.players
    Player.notify("game:win", attacker, defender)
    Player.notify("game:lost", defender, attacker)
    state
  end

end
