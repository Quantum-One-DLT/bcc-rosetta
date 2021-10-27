module.exports = {
  apps : [
    {
      name: 'postgres',
      script: `/usr/lib/postgresql/12/bin/postgres`,
      args: [
        '-D',
        '/data/postgresql',
        '-c',
        `config_file=/etc/postgresql/12/main/postgresql.conf`
      ],
      autorestart: true,
      exec_mode: 'fork_mode',
      kill_timeout : 15000,
      error_file: 'NULL',
      out_file: 'NULL'
    },
    {
      name: 'bcc-node',
      script: '/usr/local/bin/bcc-node',
      args: [
        'run',
        '--config', '/config/bcc-node/config.json',
        '--database-path', '/data/node-db',
        '--socket-path', '/ipc/node.socket',
        '--topology', '/config/bcc-node/topology.json'
      ],
      autorestart: true,
      exec_mode: 'fork_mode',
      kill_timeout : 30000,
      error_file: 'NULL',
      out_file: 'NULL'
    },
    {
      name: 'bcc-db-sync',
      script: '/scripts/start_bcc-db-sync.sh',
      args: [
        '/usr/local/bin/bcc-db-sync'
      ],
      autorestart: true,
      env: {
        PGPASSFILE: '/config/bcc-db-sync/pgpass'
      },
      exec_mode: 'fork_mode',
      kill_timeout : 15000,
      error_file: 'NULL',
      out_file: 'NULL'
    },
    {
      name: 'bcc-rosetta-server',
      script: '/bcc-rosetta-server/dist/src/server/index.js',
      autorestart: true,
      env: {
        BIND_ADDRESS: '0.0.0.0',
        BCC_CLI_PATH: '/usr/local/bin/bcc-cli',
        BCC_NODE_PATH: '/usr/local/bin/bcc-node',
        BCC_NODE_SOCKET_PATH: '/ipc/node.socket',
        DB_CONNECTION_STRING: 'socket://postgres:*@/var/run/postgresql?db=cexplorer',
        DEFAULT_RELATIVE_TTL: process.env.DEFAULT_RELATIVE_TTL,
        GENESIS_SOPHIE_PATH: '/config/genesis/sophie.json',
        LOGGER_LEVEL: process.env.LOGGER_MIN_SEVERITY,
        NODE_ENV: 'development',
        PAGE_SIZE: process.env.PAGE_SIZE,
        PORT: 8080,
        TOPOLOGY_FILE_PATH: '/config/bcc-node/topology.json'
      },
      env_production: {
        NODE_ENV: 'production'
      },
      error_file: 'NULL',
      out_file: 'NULL'
    }
  ]
}