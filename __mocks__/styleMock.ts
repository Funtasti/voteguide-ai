// CSS module mock — returns a Proxy so any className lookup returns the key name
const styleMock = new Proxy({}, { get: (_target, key) => key });
export default styleMock;
