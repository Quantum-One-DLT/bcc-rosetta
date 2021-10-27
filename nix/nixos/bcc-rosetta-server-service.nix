{ lib, pkgs, config, ... }:
let
  cfg = config.services.bcc-rosetta-server;
in {
  options = {
    services.bcc-rosetta-server = {
      enable = lib.mkEnableOption "bcc-rosetta-server service";

      port = lib.mkOption {
        type = lib.types.int;
        default = 8080;
      };

      logLevel = lib.mkOption {
        type = lib.types.str;
        default = "debug";
      };

      bindAddress = lib.mkOption {
        type = lib.types.str;
        default = "0.0.0.0";
      };

      dbConnectionString = lib.mkOption {
        type = lib.types.str;
        default = "postgresql://${cfg.dbUser}:${cfg.dbPassword}@${cfg.dbHost}:${toString cfg.dbPort}/${cfg.db}";
      };

      topologyFilePath = lib.mkOption {
        type = lib.types.str;
        default = null;
      };

      bccCliPath = lib.mkOption {
        type = lib.types.str;
        default = null;
      };

      genesisPath = lib.mkOption {
        type = lib.types.nullOr lib.types.path;
        default = null;
      };

      bccNodePath = lib.mkOption {
        type = lib.types.nullOr lib.types.path;
        default = null;
      };

      bccNodeSocketPath = lib.mkOption {
        type = lib.types.nullOr lib.types.path;
        default = null;
      };

      pageSize = lib.mkOption {
        type = lib.types.int;
        default = 25;
      };

      defaultRelativeTTL = lib.mkOption {
        type = lib.types.int;
        default = 1000;
      };

      dbHost = lib.mkOption {
        type = lib.types.str;
        default = "/run/postgresql";
      };

      dbPassword = lib.mkOption {
        type = lib.types.str;
        default = ''""'';
      };

      dbPort = lib.mkOption {
        type = lib.types.int;
        default = 5432;
      };

      dbUser = lib.mkOption {
        type = lib.types.str;
        default = "cexplorer";
      };

      db = lib.mkOption {
        type = lib.types.str;
        default = "cexplorer";
      };

      enablePrometheus = lib.mkOption {
        type = lib.types.bool;
        default = true;
      };

    };
  };
  config = let
    # TODO: there has to be a better way to handle boolean env vars in nodejs???
    boolToNodeJSEnv = bool: if bool then "true" else "false";
    pluginLibPath = pkgs.lib.makeLibraryPath [
      pkgs.stdenv.cc.cc.lib
    ];
    bcc-rosetta-server = (import ../../. {}).bcc-rosetta-server;
  in lib.mkIf cfg.enable {
    systemd.services.bcc-rosetta-server = {
      wantedBy = [ "multi-user.target" ];
      environment = lib.filterAttrs (k: v: v != null) {
        PORT                     = toString cfg.port;
        LOGGER_LEVEL             = cfg.logLevel;
        BIND_ADDRESS             = cfg.bindAddress;
        DB_CONNECTION_STRING     = cfg.dbConnectionString;
        TOPOLOGY_FILE_PATH       = cfg.topologyFilePath;
        BCC_CLI_PATH         = cfg.bccCliPath;
        GENESIS_SOPHIE_PATH     = cfg.genesisPath;
        BCC_NODE_PATH        = cfg.bccNodePath;
        BCC_NODE_SOCKET_PATH = cfg.bccNodeSocketPath;
        PAGE_SIZE                = toString cfg.pageSize;
        DEFAULT_RELATIVE_TTL     = toString cfg.defaultRelativeTTL;
        PROMETHEUS_METRICS       = boolToNodeJSEnv cfg.enablePrometheus;
      };
      path = with pkgs; [ netcat curl postgresql jq glibc.bin patchelf ];
      script = ''
        exec ${bcc-rosetta-server}/bin/bcc-rosetta-server
      '';
    };
  };
}
