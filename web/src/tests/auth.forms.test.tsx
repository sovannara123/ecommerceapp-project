import { describe, expect, it, vi } from "vitest";
import userEvent from "@testing-library/user-event";
import { screen } from "@testing-library/react";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { renderWithProviders } from "@/tests/test-utils";

const push = vi.fn();
const refresh = vi.fn();
const mutateAsync = vi.fn().mockResolvedValue({});

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh })
}));

vi.mock("@/features/auth/hooks/useAuthActions", () => ({
  useAuthActions: () => ({
    login: { mutateAsync, isPending: false },
    register: { mutateAsync: vi.fn(), isPending: false },
    logout: { mutateAsync: vi.fn(), isPending: false }
  })
}));

describe("LoginForm", () => {
  it("submits normalized email", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />);

    await user.type(screen.getByLabelText("Email"), "  USER@Example.com ");
    await user.type(screen.getByLabelText("Password"), "secret");
    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(mutateAsync).toHaveBeenCalledWith({ email: "user@example.com", password: "secret" });
    expect(push).toHaveBeenCalledWith("/");
  });
});
