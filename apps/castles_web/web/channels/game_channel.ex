defmodule CastlesWeb.GameChannel do
  use Phoenix.Channel
  require Logger

  def join("game:" <> game_id, _auth_msg, socket) do
    data = %{
      name: socket.assigns.name,
      color: socket.assigns.color
    }
    Process.put :game_id, game_id
    {:ok, state} = call_game(:connect, [data])
    Logger.info "respond with #{inspect state}"
    {:ok, state, socket}
  end

  def handle_info({:game, event, data}, socket) do
    Logger.info "push event #{event} : #{inspect data}"
    push socket, event, data
    {:noreply, socket}
  end

  def handle_in("player:prepared", defences, socket) do
    Logger.info "Player prepared: #{inspect defences}"
    :ok = call_game(:player_defence_ready, [defences])
    {:noreply, socket}
  end

  def handle_in("player:attack", attack, socket) do
    Logger.info "Player prepared: #{inspect attack}"
    :ok = call_game(:player_attack, [attack])
    {:noreply, socket}
  end

  def call_game(function, args) do
    import CastlesGame.GameSupervisor
    game_pid = ensure_game_exists(Process.get(:game_id))
    apply(CastlesGame.Game, function, [game_pid | args])
  end

end
