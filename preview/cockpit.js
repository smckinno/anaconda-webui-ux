const location = {
    path: [],
    options: {},
    go(path) { this.path = path; },
    decode(value) { return value; },
    encode(value) { return value; },
};

const task = () => Promise.resolve("");
task.stream = () => task;
task.catch = Promise.prototype.catch.bind(Promise.resolve(""));

const fakeDbusCall = (_path, _interface, method, args = []) => {
    const gib = 1024 ** 3;
    const values = {
        CalculateRequiredSpace: 12 * gib,
        GetDiskTotalSpace: 80 * gib,
        GetDiskFreeSpace: 80 * gib,
        GetFreeSpaceForSystem: 80 * gib,
        GetRequiredDeviceSize: 12 * gib,
        GetMountPointConstraints: [{ "mount-point": { v: "/" }, "required-filesystem-type": { v: "" }, required: { v: true }, recommended: { v: true } }],
        GetFormatTypeData: { description: { v: "Btrfs" } },
        GatherRequests: [],
        CreatePartitioning: "/org/fedoraproject/Anaconda/Preview/Partitioning",
        GetDeviceTree: "/preview/tree",
    };
    if (method === "Get") {
        const name = args?.[1];
        return Promise.resolve([{ v: values[name] ?? (name === "Requests" ? [] : "") }]);
    }
    return Promise.resolve([values[method] ?? []]);
};

const cockpit = {
    gettext: value => value,
    ngettext: (one, many, count) => count === 1 ? one : many,
    noop: value => value,
    format: (message, ...values) => message.replace(/\$(\d+)/g, (_, n) => values[Number(n)] ?? ""),
    format_bytes: value => `${Math.round(Number(value || 0) / (1024 ** 3))} GiB`,
    variant: (signature, value) => ({ t: signature, v: value }),
    assert: (condition, message) => { if (!condition) console.warn(`Preview assertion: ${message || "condition failed"}`); },
    language: "en-US",
    language_direction: "ltr",
    location,
    transport: { wait: callback => callback?.(), origin: "http://127.0.0.1:8765" },
    hint: () => {},
    jump: () => {},
    message: () => {},
    spawn: () => Promise.resolve(""),
    file: () => ({ read: () => Promise.resolve(""), replace: task, modify: task }),
    dbus: () => ({
        proxy: () => ({ wait: () => Promise.resolve(), call: fakeDbusCall, valid: true }),
        proxies: () => ({ wait: () => Promise.resolve(), addEventListener: () => {}, forEach: () => {} }),
        call: fakeDbusCall,
        addEventListener: () => {},
        subscribe: () => ({ remove: () => {} }),
        close: () => {},
    }),
    event_target: object => object,
    cache: () => ({ claim: () => {} }),
};

export default cockpit;
