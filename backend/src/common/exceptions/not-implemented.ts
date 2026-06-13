import { HttpError } from "./http-error.js";

export function notImplemented(contractName: string): never {
  throw new HttpError(501, `${contractName} contract is scaffolded but not implemented`, "NOT_IMPLEMENTED");
}
