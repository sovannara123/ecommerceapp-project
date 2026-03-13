import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CartView } from "@/features/cart/components/CartView";
import { renderWithProviders } from "@/tests/test-utils";

const updateMutateAsync = vi.fn().mockResolvedValue({});
const removeMutateAsync = vi.fn().mockResolvedValue({});

vi.mock("@/features/cart/hooks/useCart", () => ({
  useCart: () => ({
    isLoading: false,
    data: {
      items: [{ productId: "p1", qty: 2, priceSnapshot: 10 }]
    }
  }),
  useCartMutations: () => ({
    add: { mutateAsync: vi.fn() },
    update: { mutateAsync: updateMutateAsync },
    remove: { mutateAsync: removeMutateAsync },
    clear: { mutateAsync: vi.fn() }
  })
}));

describe("CartView", () => {
  it("updates and removes cart items", async () => {
    const user = userEvent.setup();
    renderWithProviders(<CartView />);

    await user.click(screen.getByRole("button", { name: "+" }));
    expect(updateMutateAsync).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Remove" }));
    expect(removeMutateAsync).toHaveBeenCalledWith({ productId: "p1" });
  });
});
