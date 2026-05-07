const { createClient } = require("@supabase/supabase-js");

const DEFAULT_CACHE_CONTROL = "3600";

let cachedClient;

const getRequiredEnv = (name) => {
  const value = process.env[name];

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
};

const getSupabaseUrl = () => getRequiredEnv("SUPABASE_URL");
const getSupabaseBucket = () =>
  process.env.SUPABASE_STORAGE_BUCKET || "Multi-Vendor Ecommerce Platform";

const getSupabaseServiceRoleKey = () => getRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");

const getSupabaseClient = () => {
  if (!cachedClient) {
    cachedClient = createClient(getSupabaseUrl(), getSupabaseServiceRoleKey(), {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }

  return cachedClient;
};

const titleCaseWord = (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

const slugifyCategoryFolder = (categoryName) => {
  const words = String(categoryName || "")
    .trim()
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map(titleCaseWord);

  return words.length ? words.join("-") : "Uncategorized";
};

const sanitizeFileName = (fileName) => {
  const normalized = String(fileName || "image")
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^a-zA-Z0-9._+-]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || "image";
};

const pad = (value, length = 2) => String(value).padStart(length, "0");

const buildTimestampPrefix = (date = new Date()) => {
  const randomSuffix = pad(Math.floor(Math.random() * 1000), 3);

  return [
    `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}`,
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`,
    `${pad(date.getMilliseconds(), 3)}${randomSuffix}`,
  ].join("_");
};

const buildProductImageObjectPath = (categoryName, originalFileName) => {
  const folder = slugifyCategoryFolder(categoryName);
  const fileName = `${buildTimestampPrefix()}_${sanitizeFileName(originalFileName)}`;
  return `${folder}/${fileName}`;
};

const buildUserAssetObjectPath = (userId, assetType, originalFileName) => {
  const folderName = assetType === "background" ? "Background" : "Profile";
  const fileName = `${buildTimestampPrefix()}_${sanitizeFileName(originalFileName)}`;
  return `Users/${String(userId)}/${folderName}/${fileName}`;
};

const getPublicUrlForObjectPath = (objectPath) => {
  const { data } = getSupabaseClient()
    .storage
    .from(getSupabaseBucket())
    .getPublicUrl(objectPath);

  return data.publicUrl;
};

const uploadImageBuffer = async ({
  buffer,
  mimeType,
  objectPath,
  cacheControl = DEFAULT_CACHE_CONTROL,
}) => {
  const { error } = await getSupabaseClient()
    .storage
    .from(getSupabaseBucket())
    .upload(objectPath, buffer, {
      cacheControl,
      contentType: mimeType || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    throw new Error(`Supabase upload failed: ${error.message}`);
  }

  return getPublicUrlForObjectPath(objectPath);
};

const getPublicBucketBaseUrl = () =>
  `${getSupabaseUrl().replace(/\/+$/, "")}/storage/v1/object/public/${encodeURIComponent(getSupabaseBucket())}/`;

const extractObjectPathFromPublicUrl = (publicUrl) => {
  if (!publicUrl || typeof publicUrl !== "string") {
    return null;
  }

  const baseUrl = getPublicBucketBaseUrl();
  if (!publicUrl.startsWith(baseUrl)) {
    return null;
  }

  return decodeURIComponent(publicUrl.slice(baseUrl.length));
};

const deleteObjectByPath = async (objectPath) => {
  if (!objectPath) {
    return;
  }

  const { error } = await getSupabaseClient()
    .storage
    .from(getSupabaseBucket())
    .remove([objectPath]);

  if (error) {
    throw new Error(`Supabase delete failed: ${error.message}`);
  }
};

const deleteObjectByPublicUrl = async (publicUrl) => {
  const objectPath = extractObjectPathFromPublicUrl(publicUrl);
  if (!objectPath) {
    return;
  }

  await deleteObjectByPath(objectPath);
};

const deleteObjectsByPublicUrls = async (publicUrls) => {
  const objectPaths = Array.from(
    new Set((Array.isArray(publicUrls) ? publicUrls : [publicUrls])
      .map(extractObjectPathFromPublicUrl)
      .filter(Boolean))
  );

  if (!objectPaths.length) {
    return;
  }

  const { error } = await getSupabaseClient()
    .storage
    .from(getSupabaseBucket())
    .remove(objectPaths);

  if (error) {
    throw new Error(`Supabase delete failed: ${error.message}`);
  }
};

const isSupabaseStorageUrl = (value) => Boolean(extractObjectPathFromPublicUrl(value));

const resetSupabaseClientForTests = () => {
  cachedClient = undefined;
};

module.exports = {
  buildProductImageObjectPath,
  buildTimestampPrefix,
  buildUserAssetObjectPath,
  deleteObjectByPath,
  deleteObjectByPublicUrl,
  deleteObjectsByPublicUrls,
  extractObjectPathFromPublicUrl,
  getPublicUrlForObjectPath,
  getSupabaseBucket,
  getSupabaseClient,
  isSupabaseStorageUrl,
  resetSupabaseClientForTests,
  sanitizeFileName,
  slugifyCategoryFolder,
  uploadImageBuffer,
};
