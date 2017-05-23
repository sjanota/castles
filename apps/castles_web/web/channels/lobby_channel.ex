defmodule CastlesWeb.LobbyChannel do
  use Phoenix.Channel
  require Logger
  alias CastlesWeb.Presence

  intercept [
    "player:challenge:begin",
    "player:challenge:start",
    "player:challenge:accept",
    "player:challenge:decline"
  ]

  def join("lobby:public", _auth_msg, socket) do
    player_data = %{
      name: socket.assigns.name,
      color: socket.assigns.color
    }
    precenses = Presence.list(socket)
    if Enum.any?(Map.keys(precenses), fn p -> p == player_data.name end) do
      {:error, %{reason: "player with that name exists"}}
    else
      Process.send self(), {:after_join, player_data}, []
      {:ok, precenses, socket}
    end
  end

  def handle_info({:after_join, player_data}, socket) do
    {:ok, _} = Presence.track(socket, player_data.name, player_data)
    {:noreply, socket}
  end

  def handle_in("player:challenge:" <> action, data, socket) do
    broadcast socket, "player:challenge:" <> action, Map.put(data, "by", socket.assigns.name)
    {:noreply, socket}
  end

  def handle_out("player:challenge:" <> action, %{"target" => target} = data, socket) do
    Logger.info ("Challenge action #{action} with data #{inspect data}")
    if target == socket.assigns.name do
      push socket, "player:challenge:" <> action, data
    end
    {:noreply, socket}
  end

end
