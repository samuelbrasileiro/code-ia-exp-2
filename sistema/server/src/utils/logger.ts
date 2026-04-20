const LEVELS = { debug: 0, info: 1, warn: 2, error: 3 } as const
type Level = keyof typeof LEVELS

const MIN_LEVEL: Level = (process.env.LOG_LEVEL as Level) ?? 'debug'

function timestamp(): string {
  return new Date().toISOString()
}

function log(level: Level, context: string, message: string, data?: unknown): void {
  if (LEVELS[level] < LEVELS[MIN_LEVEL]) return

  const prefix = `[${timestamp()}] [${level.toUpperCase().padEnd(5)}] [${context}]`
  const line = data !== undefined
    ? `${prefix} ${message} ${JSON.stringify(data)}`
    : `${prefix} ${message}`

  if (level === 'error') {
    console.error(line)
  } else if (level === 'warn') {
    console.warn(line)
  } else {
    console.log(line)
  }
}

export function createLogger(context: string) {
  return {
    debug: (msg: string, data?: unknown) => log('debug', context, msg, data),
    info:  (msg: string, data?: unknown) => log('info',  context, msg, data),
    warn:  (msg: string, data?: unknown) => log('warn',  context, msg, data),
    error: (msg: string, data?: unknown) => log('error', context, msg, data),
  }
}
