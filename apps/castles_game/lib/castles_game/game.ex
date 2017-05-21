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

  defmodule Unit do
    def empty do
      %{type: "empty", alive: true}
    end

    def unknown do
      %{type: "unknown", alive: true}
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
        Map.put(player, :defensive, hidden_army(5))
      else
        player
      end
    end

    def set_defences(player, defences) do
      player
      |> Map.put(:defensive, defences)
      |> Map.put(:defence_ready, true)
    end

    def notify(event, player, opponent) do
      %{pid: pid} = player
      event_data = %{
        me: show(player),
        opponent: hide(opponent)
      }
      Process.send pid, {:game, event, event_data}, []
    end

    defp empty_army(size) do
      for _n <- 1..size, do: Unit.empty
    end

    defp hidden_army(size) do
      for _n <- 1..size, do: Unit.unknown
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
      Player.set_defences(player, defences)
    end)
    if all_players_defence_ready(state) do
      state = next_turn(state)
    end
    {:reply, :ok, state}
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

  def update_player_by_pid_inner([%{pid: pid1} = player | other], pid2, cb)
  when pid1 == pid2 do
    [apply(cb, [player]) | other]
  end

  def update_player_by_pid_inner([p | other], pid, callback) do
    [p | update_player_by_pid_inner(other, pid, callback)]
  end

  defp next_turn(state) do
    [p1, p2] = state.players
    Player.notify("game:your-turn", p1, p2)
    Player.notify("game:opponent-turn", p2, p1)
    Map.put(state, :players, Enum.reverse(state.players))
  end

  defp all_players_defence_ready(state) do
    Enum.all?(state.players, fn p -> p.defence_ready end)
  end

end
