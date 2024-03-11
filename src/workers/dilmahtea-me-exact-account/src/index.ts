import createModuleWorker from "../../../utils/createModuleWorker";

import handleAccountPOST from "./endpoints/account/handlePOST";
import handleAccountPUT from "./endpoints/account/handlePUT";

export default createModuleWorker({
  pathname: "/account",
  methods: { POST: handleAccountPOST, PUT: handleAccountPUT },
});
