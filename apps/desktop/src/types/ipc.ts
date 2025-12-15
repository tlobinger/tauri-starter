/**
 * IPC command typing.
 *
 * Why?
 * - Keeps a single list of the commands your frontend can call.
 * - Lets `ipcInvoke` be type-safe (request + response).
 */

export type IpcCommandMap = {
  init_database: {
    payload: undefined;
    response: void;
  };
};

export type IpcCommandName = keyof IpcCommandMap;


