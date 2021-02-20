import KoaRouter from 'koa-router';
import permissionController from '../controller/admin/permission';

const router = new KoaRouter({ prefix: '/api/admin' });

router.get('/permission', permissionController.getPermission);

router.post('/permission', permissionController.addPermission);

router.put('/permission/:id', permissionController.updatePermission);

router.delete('/permission/:id', permissionController.deletePermission);

export default router;
