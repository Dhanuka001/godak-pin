const clients = new Map();

const keepAlive = (res) => {
  res.write(':ok\n\n');
};

const sendEvent = (userId, event, data) => {
  const entries = clients.get(userId);
  if (!entries || !entries.length) return;
  const payload = JSON.stringify(data);
  entries.forEach((entry) => {
    try {
      entry.res.write(`event: ${event}\n`);
      entry.res.write(`data: ${payload}\n\n`);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.warn('Failed to send SSE event', err);
    }
  });
};

const registerClient = (userId, res) => {
  if (!userId || !res) return () => {};
  const entry = { res };
  const key = userId.toString();
  if (!clients.has(key)) {
    clients.set(key, []);
  }
  clients.get(key).push(entry);
  entry.res.write('retry: 10000\n');
  entry.res.write('event: connected\n');
  entry.res.write('data: {}\n\n');
  const interval = setInterval(() => keepAlive(res), 25000);
  res.on('close', () => {
    clearInterval(interval);
    const list = clients.get(key) || [];
    clients.set(key, list.filter((item) => item !== entry));
    if (!clients.get(key)?.length) {
      clients.delete(key);
    }
  });
  return () => {
    clearInterval(interval);
    const list = clients.get(key) || [];
    clients.set(key, list.filter((item) => item !== entry));
    if (!clients.get(key)?.length) {
      clients.delete(key);
    }
  };
};

const broadcastToUsers = (userIds, event, data) => {
  userIds.forEach((id) => sendEvent(id.toString(), event, data));
};

module.exports = { registerClient, sendEvent, broadcastToUsers };
