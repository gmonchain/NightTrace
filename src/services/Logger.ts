/**
 * `Logger` is the only module in NightTrace that logs.
 *
 * AD-30: crash reporting is local — there is no third-party SDK, no upload and
 * no identifier — so this module plus AD-11's session checkpoint is the entire
 * crash story. The Consistency Conventions make it the sole producer of log
 * output: `no-console` is an error everywhere under `src/**` except here.
 *
 * What it accepts is deliberately narrow: a `LogLevel`, a message drawn from a
 * closed set of codes (never free text), and structured scalar fields
 * (numbers, booleans, null). Evidence content, coordinates and prose have no
 * representation in the type, so they cannot be logged by accident.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * The closed message set. A new log site adds a code here — a compile error
 * until it does — rather than passing an arbitrary string through.
 */
export type LogCode =
  | 'kv.get_failed'
  | 'kv.parse_failed'
  | 'kv.write_failed'
  | 'kv.remove_failed';

/** A field value is a scalar: never free text, never evidence, never a coordinate. */
export type LogScalar = number | boolean | null;

export type LogFields = Readonly<Record<string, LogScalar>>;

/** The record handed to the sink. `code` is closed; fields are scalars. */
export type LogRecord = Readonly<{
  level: LogLevel;
  code: LogCode;
  fields: LogFields;
}>;

export type LogSink = (record: LogRecord) => void;

const CONSOLE_SINK: LogSink = (record) => {
  switch (record.level) {
    case 'debug':
      console.debug(record);
      return;
    case 'info':
      console.info(record);
      return;
    case 'warn':
      console.warn(record);
      return;
    case 'error':
      console.error(record);
      return;
  }
};

let sink: LogSink = CONSOLE_SINK;

function emit(level: LogLevel, code: LogCode, fields: LogFields = {}): void {
  sink({ level, code, fields });
}

export const Logger = {
  debug(code: LogCode, fields?: LogFields): void {
    emit('debug', code, fields);
  },
  info(code: LogCode, fields?: LogFields): void {
    emit('info', code, fields);
  },
  warn(code: LogCode, fields?: LogFields): void {
    emit('warn', code, fields);
  },
  error(code: LogCode, fields?: LogFields): void {
    emit('error', code, fields);
  },

  /**
   * Test seam only. Production paths never replace the sink; the exported
   * object is otherwise the module's whole surface.
   */
  __setSink(next: LogSink | null): void {
    sink = next ?? CONSOLE_SINK;
  },
} as const;
