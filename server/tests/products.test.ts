import { productController } from "../src/controllers/productController.js";
import { invoke } from "./helpers/httpMock.js";

describe("products", () => {
  it("list products validates malformed categoryId", async () => {
    const res = await invoke(productController.list, {
      query: { categoryId: "abc" },
    });

    expect(res.statusCode).toBe(400);
    expect((res.body as any)?.error).toBe("VALIDATION_ERROR");
  });
});
