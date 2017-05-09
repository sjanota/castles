# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.
use Mix.Config

# Configures the endpoint
config :castles_web, CastlesWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "D+9sG2yKdqK68EUaQeFq/vEUYHMs39HO4o9bfyBej6g4ORgweyWHFjPCt2O8RiJZ",
  render_errors: [view: CastlesWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: CastlesWeb.PubSub,
           adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env}.exs"
