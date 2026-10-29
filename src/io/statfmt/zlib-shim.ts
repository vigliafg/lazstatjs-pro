/**
 * Browser shim for `node:zlib`.
 *
 * `@irbisadm/statfmt` imports zlib at module scope only to read or write
 * compressed `.zsav` files. LazStats accepts uncompressed `.sav` and `.dta`,
 * so the browser build can replace the Node builtin with this explicit error
 * instead of failing to bundle the package.
 */
const unsupported = (): never => {
  throw new Error('Compressed .zsav files are not supported. Export the data as .sav or .dta.');
};

export const inflateSync = unsupported;
export const deflateSync = unsupported;
