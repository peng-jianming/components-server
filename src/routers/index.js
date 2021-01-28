import combineRoutes from "koa-combine-routers";
import login from "./login";
import workbench from "./workbench";
import user from "./user";

export default combineRoutes(login, workbench, user);
