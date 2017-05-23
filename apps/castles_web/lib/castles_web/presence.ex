defmodule CastlesWeb.Presence do
  use Phoenix.Presence, otp_app: :castles_web,
                        pubsub_server: CastlesWeb.PubSub
end
