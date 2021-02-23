import KorRouter from 'koa-router';
import TicketListController from '../controller/ticket/list';
import koaJwt from 'koa-jwt';

const router = new KorRouter({ prefix: '/api/workbench' });

const auth = koaJwt({ secret: 'shared-secret' });

router.get('/me', auth, TicketListController.aboutMeTicket);

export default router;
