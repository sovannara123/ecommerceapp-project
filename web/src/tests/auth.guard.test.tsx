import { describe, expect, it, vi, beforeEach } from "vitest";
import { renderWithProviders } from "@/tests/test-utils";
import { AuthGuard } from "@/features/auth/components/AuthGuard";
import { useAuthStore } from "@/features/auth/hooks/useAuthStore";

const replace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ replace })
}));

describe("AuthGuard", () => {
  beforeEach(() => {
    replace.mockReset();
    useAuthStore.setState({ hydrated: true, accessToken: null, user: null, expiresAt: null });
  });

  it("redirects to login when not authenticated", () => {
    renderWithProviders(<AuthGuard><div>secret</div></AuthGuard>);
    expect(replace).toHaveBeenCalledWith("/login");
  });

  it("renders children when authenticated", () => {
    useAuthStore.setState({ hydrated: true, accessToken: "token", user: null, expiresAt: null });
    const { getByText } = renderWithProviders(<AuthGuard><div>secret</div></AuthGuard>);
    expect(getByText("secret")).toBeInTheDocument();
  });
});
