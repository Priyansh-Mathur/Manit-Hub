/**
 * In-memory online-presence registry shared by the Socket.IO layer and REST
 * controllers (same process). Maps a userId → Set of live socket ids, so a
 * user counts as "online" while they hold at least one socket.
 *
 * Note: this is per-process and ephemeral. On a serverless host (e.g. Vercel)
 * sockets don't persist, so everyone simply reads as offline — a graceful
 * degradation, identical to the existing chat limitation.
 */
const userSockets = new Map(); // userId(string) -> Set<socketId>

/** Returns true if this is the user's FIRST live socket (became online). */
function addSocket(userId, socketId) {
  const key = userId.toString();
  let set = userSockets.get(key);
  const becameOnline = !set || set.size === 0;
  if (!set) {
    set = new Set();
    userSockets.set(key, set);
  }
  set.add(socketId);
  return becameOnline;
}

/** Returns true if this was the user's LAST live socket (became offline). */
function removeSocket(userId, socketId) {
  const key = userId.toString();
  const set = userSockets.get(key);
  if (!set) return false;
  set.delete(socketId);
  if (set.size === 0) {
    userSockets.delete(key);
    return true;
  }
  return false;
}

function isOnline(userId) {
  const set = userSockets.get(userId.toString());
  return !!set && set.size > 0;
}

/** Filter a list of ids down to those currently online (as strings). */
function onlineAmong(userIds) {
  return userIds.map(String).filter((id) => isOnline(id));
}

module.exports = { addSocket, removeSocket, isOnline, onlineAmong };
