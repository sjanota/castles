defmodule CastlesGame.GameSupervisor do
  use Supervisor

  def start_link do
    Supervisor.start_link(__MODULE__, [], name: __MODULE__)
  end

  def ensure_game_exists(game_id) do
    import Supervisor
    case start_child(__MODULE__, spec(game_id)) do
      {:ok, pid} -> pid;
      {:error, {_, pid}} when is_pid(pid) -> pid
    end
  end

  def init([]) do
    children = []
    opts = [strategy: :one_for_one]
    supervise(children, opts)
  end

  defp spec(game_id) do
    import Supervisor.Spec
    worker(CastlesGame.Game, [game_id], restart: :temporary, id: game_id)
  end

end
