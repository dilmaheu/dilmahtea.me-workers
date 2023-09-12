import type { ENV } from "./types";

import environment from "../../../utils/env";

export default function env(): ENV {
  return environment<ENV>();
}
