defmodule CastlesGame do
  use Application

  def start(_start_type, _start_args) do
    import Supervisor.Spec
    children = [
      supervisor(CastlesGame.GameSupervisor, []),
      supervisor(CastlesGame.LobbySupervisor, [])
    ]
    opts = [strategy: :one_for_one, name: CastlesGame.Supervisor]
    Supervisor.start_link(children, opts)
  end

end
