defmodule CastlesGame.LobbySupervisor do
  use Supervisor

  def start_link do
    Supervisor.start_link(__MODULE__, [], name: __MODULE__)
  end

  def ensure_lobby_exists(lobby_id) do
    import Supervisor
    case start_child(__MODULE__, spec(lobby_id)) do
      {:ok, pid} -> pid;
      {:error, {_, pid}} when is_pid(pid) -> pid
    end
  end

  def init([]) do
    children = []
    opts = [strategy: :one_for_one]
    supervise(children, opts)
  end

  defp spec(lobby_id) do
    import Supervisor.Spec
    worker(CastlesGame.Lobby, [lobby_id], restart: :temporary, id: lobby_id)
  end

end
