declare namespace NodeJS {
  interface ProcessEnv {
    PORT?: number;
    BIND_ADDRESS?: string;
    DB_CONNECTION_STRING: string;
    LOGGER_LEVEL: string;
    LOGGER_ENABLED?: string;
    BCC_CLI_PATH: string;
    GENESIS_SOPHIE_PATH: string;
    DEFAULT_RELATIVE_TTL: number;
    BCC_NODE_PATH: string;
    TOPOLOGY_FILE_PATH: string;
    EXEMPTION_TYPES_PATH: string;
    BODY_LIMIT: string;
  }
}
