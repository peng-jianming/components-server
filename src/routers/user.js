import KoaRouter from 'koa-router';
import UserController from '../controller/user';
import koaJwt from 'koa-jwt';
const router = new KoaRouter({ prefix: '/api/user' });

const auth = koaJwt({ secret: 'shared-secret' });

router.get('/', auth, UserController.getUser);

router.get('/all', auth, UserController.getAllUser);

router.post('/avatar', UserController.uploadAvatar);

router.put('/', auth, UserController.updateUser);

router.patch('/changePassword', auth, UserController.changePassword);

router.get('/search', UserController.searchUserName);

router.get('/message', auth, UserController.getMessage);

router.patch('/message', auth, UserController.postMessage);

export default router;
