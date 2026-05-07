const mockUpload = jest.fn();
const mockRemove = jest.fn();
const mockGetPublicUrl = jest.fn();
const mockFrom = jest.fn();
const mockCreateClient = jest.fn();

jest.mock("@supabase/supabase-js", () => ({
  createClient: (...args) => mockCreateClient(...args),
}));

describe("storageService", () => {
  beforeEach(() => {
    jest.resetModules();
    mockUpload.mockReset();
    mockRemove.mockReset();
    mockGetPublicUrl.mockReset();
    mockFrom.mockReset();
    mockCreateClient.mockReset();

    process.env.SUPABASE_URL = "https://xmtebmsobqfkvpoylryo.supabase.co";
    process.env.SUPABASE_SERVICE_ROLE_KEY = "service-role-key";
    process.env.SUPABASE_STORAGE_BUCKET = "Multi-Vendor Ecommerce Platform";

    mockUpload.mockResolvedValue({ data: { path: "Accessories/file.webp" }, error: null });
    mockRemove.mockResolvedValue({ data: [], error: null });
    mockGetPublicUrl.mockImplementation((objectPath) => ({
      data: {
        publicUrl: `https://xmtebmsobqfkvpoylryo.supabase.co/storage/v1/object/public/Multi-Vendor%20Ecommerce%20Platform/${objectPath}`,
      },
    }));
    mockFrom.mockReturnValue({
      upload: mockUpload,
      remove: mockRemove,
      getPublicUrl: mockGetPublicUrl,
    });
    mockCreateClient.mockReturnValue({
      storage: {
        from: mockFrom,
      },
    });
  });

  it("uploads an image buffer and returns the public URL", async () => {
    const {
      buildProductImageObjectPath,
      uploadImageBuffer,
    } = require("../utils/storageService");

    const objectPath = buildProductImageObjectPath("Accessories", "sample image.webp");
    const publicUrl = await uploadImageBuffer({
      buffer: Buffer.from("image"),
      mimeType: "image/webp",
      objectPath,
    });

    expect(mockCreateClient).toHaveBeenCalledTimes(1);
    expect(mockFrom).toHaveBeenCalledWith("Multi-Vendor Ecommerce Platform");
    expect(mockUpload).toHaveBeenCalledWith(
      objectPath,
      expect.any(Buffer),
      expect.objectContaining({
        contentType: "image/webp",
        upsert: false,
      })
    );
    expect(publicUrl).toBe(
      `https://xmtebmsobqfkvpoylryo.supabase.co/storage/v1/object/public/Multi-Vendor%20Ecommerce%20Platform/${objectPath}`
    );
  });

  it("extracts the object path from a Supabase public URL", () => {
    const { extractObjectPathFromPublicUrl } = require("../utils/storageService");

    expect(
      extractObjectPathFromPublicUrl(
        "https://xmtebmsobqfkvpoylryo.supabase.co/storage/v1/object/public/Multi-Vendor%20Ecommerce%20Platform/Accessories/file.webp"
      )
    ).toBe("Accessories/file.webp");
    expect(extractObjectPathFromPublicUrl("https://example.com/not-supabase")).toBeNull();
  });

  it("deletes a deduplicated set of object paths from public URLs", async () => {
    const { deleteObjectsByPublicUrls } = require("../utils/storageService");

    await deleteObjectsByPublicUrls([
      "https://xmtebmsobqfkvpoylryo.supabase.co/storage/v1/object/public/Multi-Vendor%20Ecommerce%20Platform/Accessories/file.webp",
      "https://xmtebmsobqfkvpoylryo.supabase.co/storage/v1/object/public/Multi-Vendor%20Ecommerce%20Platform/Accessories/file.webp",
      "https://xmtebmsobqfkvpoylryo.supabase.co/storage/v1/object/public/Multi-Vendor%20Ecommerce%20Platform/Users/abc/Profile/me.png",
      "/uploads/local-only.png",
    ]);

    expect(mockRemove).toHaveBeenCalledWith([
      "Accessories/file.webp",
      "Users/abc/Profile/me.png",
    ]);
  });
});
