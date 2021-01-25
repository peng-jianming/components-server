import combineRoutes from "koa-combine-routers";
import login from "./login";
import workbench from "./workbench";

export default combineRoutes(login, workbench);
