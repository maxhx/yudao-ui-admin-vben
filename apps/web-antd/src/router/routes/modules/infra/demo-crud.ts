import type { RouteRecordRaw } from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/infra/demo-crud',
    name: 'InfraDemoCrud',
    component: () => import('#/views/infra/demo/crud/index.vue'),
    meta: { title: 'CRUD Demo', icon: 'mdi:database' },
  },
];

export default routes;
