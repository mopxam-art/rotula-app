import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AuthProvider } from "@/context/AuthContext";
import { useAuth } from "@/hooks/useAuth";

const STORAGE_KEY = "kolo_auth";

function AuthProbe() {
  const { isAuthenticated, isLoading, user, login, logout } = useAuth();

  return (
    <div>
      <span data-testid="loading">{String(isLoading)}</span>
      <span data-testid="authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user">{user?.name ?? "anonymous"}</span>
      <button onClick={() => login({ name: "Ada" })}>login</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

beforeEach(() => {
  window.localStorage.clear();
});

afterEach(() => {
  window.localStorage.clear();
  vi.restoreAllMocks();
});

describe("AuthProvider", () => {
  it("reports isLoading: true in the server snapshot", () => {
    const html = renderToString(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(html).toContain('data-testid="loading">true<');
    expect(html).toContain('data-testid="authenticated">false<');
  });

  it("hydrates an existing session from the kolo_auth key", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ id: "u9", name: "Grace", email: "g@rotula.app" }),
    );

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(screen.getByTestId("loading")).toHaveTextContent("false");
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("user")).toHaveTextContent("Grace");
  });

  it("login persists the session and flips isAuthenticated", () => {
    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");

    fireEvent.click(screen.getByRole("button", { name: "login" }));

    expect(
      JSON.parse(window.localStorage.getItem(STORAGE_KEY) as string),
    ).toMatchObject({ name: "Ada" });
    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("user")).toHaveTextContent("Ada");
  });

  it("logout clears the persisted session", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ id: "u1", name: "Ada", email: "ada@rotula.app" }),
    );

    render(
      <AuthProvider>
        <AuthProbe />
      </AuthProvider>,
    );

    expect(screen.getByTestId("authenticated")).toHaveTextContent("true");

    fireEvent.click(screen.getByRole("button", { name: "logout" }));

    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
  });
});

describe("useAuth", () => {
  it("throws when used outside an AuthProvider", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<AuthProbe />)).toThrow(
      "useAuth must be used within an AuthProvider",
    );
  });
});
