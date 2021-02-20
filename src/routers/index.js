import combineRoutes from 'koa-combine-routers';
import login from './login';
import workbench from './workbench';
import user from './user';
import ticketList from './ticket';
import admin from './admin';

export default combineRoutes(login, workbench, user, ticketList, admin);
