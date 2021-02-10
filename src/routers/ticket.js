import KoaRouter from 'koa-router';
import TicketListController from '../controller/ticket/list';
import TicketDetailController from '../controller/ticket/detail';
import koaJwt from 'koa-jwt';

const auth = koaJwt({ secret: 'shared-secret' });

const router = new KoaRouter({ prefix: '/api/ticket' });

// 创建工单
router.post('/create', auth, TicketListController.createTicket);

// 工单列表
router.get('/list', TicketListController.ticketList);

router.get('/me', auth, TicketListController.aboutMeTicket);

// 工单详情
router.get('/:id', TicketDetailController.ticketDetail);

router.post('/', auth, TicketDetailController.handleTicket);

export default router;
