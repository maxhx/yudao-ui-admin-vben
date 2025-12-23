import { requestClient } from '#/api/request';

export namespace DemoCrudApi {
  export interface Item {
    id: number;
    name?: string;
    desc?: string;
  }
}

/** 查询示例分页 */
export function pageDemo(params: any) {
  return requestClient.get<{ items: DemoCrudApi.Item[]; total: number }>(
    '/infra/demo-crud/page',
    { params },
  );
}

/** 查询示例详情 */
export function getDemo(id: number) {
  return requestClient.get<DemoCrudApi.Item>(`/infra/demo-crud/get?id=${id}`);
}

/** 新增示例 */
export function createDemo(data: DemoCrudApi.Item) {
  return requestClient.post('/infra/demo-crud/create', data);
}

/** 修改示例 */
export function updateDemo(data: DemoCrudApi.Item) {
  return requestClient.put('/infra/demo-crud/update', data);
}

/** 删除示例 */
export function deleteDemo(id: number) {
  return requestClient.delete(`/infra/demo-crud/delete?id=${id}`);
}
