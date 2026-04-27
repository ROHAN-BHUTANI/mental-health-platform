jest.mock("axios", () => {
  const instance = {
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() }
    },
    request: jest.fn()
  };

  return {
    __esModule: true,
    default: {
      create: jest.fn(() => instance),
      post: jest.fn()
    },
    create: jest.fn(() => instance),
    post: jest.fn(),
    __instance: instance
  };
});

describe("api refresh retry behavior", () => {
  let axios;
  let client;
  let responseErrorHandler;
  let instance;

  beforeAll(() => {
    delete window.location;
    window.location = { href: "" };
  });

  beforeEach(() => {
    jest.resetModules();
    localStorage.clear();

    axios = require("axios");
    instance = axios.__instance;
    client = require("../api/client").default;

    const responseUse = instance.interceptors.response.use;
    responseErrorHandler = responseUse.mock.calls[0][1];
  });

  test("queues concurrent 401 requests and performs a single refresh", async () => {
    localStorage.setItem("mh_refresh_token", "refresh-1");

    let resolveRefresh;
    const refreshPromise = new Promise((resolve) => {
      resolveRefresh = resolve;
    });

    axios.default.post.mockReturnValueOnce(refreshPromise);
    instance.request.mockResolvedValue({ data: { ok: true } });

    const p1 = responseErrorHandler({
      config: { headers: {} },
      response: { status: 401 }
    });

    const p2 = responseErrorHandler({
      config: { headers: {} },
      response: { status: 401 }
    });

    expect(axios.default.post).toHaveBeenCalledTimes(1);

    resolveRefresh({
      data: {
        accessToken: "new-access",
        refreshToken: "refresh-2"
      }
    });

    await Promise.all([p1, p2]);

    expect(localStorage.getItem("mh_token")).toBe("new-access");
    expect(localStorage.getItem("mh_refresh_token")).toBe("refresh-2");
    expect(instance.request).toHaveBeenCalledTimes(2);
  });

  test("clears local session if refresh fails", async () => {
    localStorage.setItem("mh_token", "old-access");
    localStorage.setItem("mh_refresh_token", "old-refresh");
    localStorage.setItem("mh_user", JSON.stringify({ id: "u1" }));

    axios.default.post.mockRejectedValueOnce(new Error("refresh failed"));

    await expect(
      responseErrorHandler({ config: { headers: {} }, response: { status: 401 } })
    ).rejects.toBeTruthy();

    expect(localStorage.getItem("mh_token")).toBeNull();
    expect(localStorage.getItem("mh_refresh_token")).toBeNull();
    expect(localStorage.getItem("mh_user")).toBeNull();
  });
});