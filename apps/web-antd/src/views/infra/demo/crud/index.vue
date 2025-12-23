<script lang="ts" setup>
import { computed, onMounted, reactive, ref } from 'vue';

import {
  Button as AButton,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  Modal as AModal,
  Space as ASpace,
  Table as ATable,
  TableColumn as ATableColumn,
  message,
  Modal,
} from 'ant-design-vue';

const STORAGE_KEY = 'demo-crud-items-v1';

const initialData = [
  { id: 1, name: 'Item A', desc: 'Desc A' },
  { id: 2, name: 'Item B', desc: 'Desc B' },
  { id: 3, name: 'Alpha', desc: 'Alpha desc' },
  { id: 4, name: 'Beta', desc: 'Beta desc' },
];

const items = ref<any[]>([]);
const loading = ref(false);
const modalLoading = ref(false);
const pagination = reactive({ current: 1, pageSize: 10, total: 0 });
const query = reactive({ name: '' });
const visible = ref(false);
const editing = reactive({ id: 0, name: '', desc: '' });

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      items.value = JSON.parse(raw);
    } else {
      items.value = [...initialData];
      saveToStorage();
    }
  } catch {
    items.value = [...initialData];
    saveToStorage();
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.value));
}

const itemsShown = computed(() => {
  const keyword = (query.name || '').toLowerCase();
  const filtered = items.value.filter((i) =>
    (i.name || '').toLowerCase().includes(keyword),
  );
  const start = (pagination.current - 1) * pagination.pageSize;
  return filtered.slice(start, start + pagination.pageSize);
});

const filteredTotal = computed(() => {
  const keyword = (query.name || '').toLowerCase();
  return items.value.filter((i) =>
    (i.name || '').toLowerCase().includes(keyword),
  ).length;
});

const fetchList = async (
  page = pagination.current,
  size = pagination.pageSize,
) => {
  loading.value = true;
  try {
    pagination.current = page;
    pagination.pageSize = size;
    pagination.total = filteredTotal.value;
    // itemsShown/computed will reflect the updated pagination and query
  } catch (error) {
    console.error(error);
    message.error('Failed to fetch list');
  } finally {
    loading.value = false;
  }
};

const openCreate = () => {
  editing.id = 0;
  editing.name = '';
  editing.desc = '';
  visible.value = true;
};

const openEdit = (row: any) => {
  editing.id = row.id;
  editing.name = row.name;
  editing.desc = row.desc;
  visible.value = true;
};

const handleOk = async () => {
  if (!editing.name) {
    message.warn('Name is required');
    return;
  }
  modalLoading.value = true;
  try {
    if (editing.id) {
      items.value = items.value.map((i) =>
        i.id === editing.id
          ? { ...i, name: editing.name, desc: editing.desc }
          : i,
      );
      message.success('Updated');
    } else {
      const id = Date.now();
      items.value.unshift({ id, name: editing.name, desc: editing.desc });
      message.success('Created');
      pagination.current = 1;
    }
    saveToStorage();
    visible.value = false;
    await fetchList(1);
  } catch (error) {
    console.error(error);
    message.error('Operation failed');
  } finally {
    modalLoading.value = false;
  }
};

const handleCancel = () => {
  visible.value = false;
};

const handleDelete = (id: number) => {
  Modal.confirm({
    title: 'Confirm',
    content: 'Are you sure to delete this item?',
    onOk: async () => {
      try {
        items.value = items.value.filter((i) => i.id !== id);
        saveToStorage();
        message.success('Deleted');
        const maxPage = Math.max(
          1,
          Math.ceil(pagination.total / pagination.pageSize),
        );
        if (pagination.current > maxPage) pagination.current = maxPage;
        await fetchList(pagination.current);
      } catch (error) {
        console.error(error);
        message.error('Delete failed');
      }
    },
  });
};

const handleTableChange = (paginationObj: any) => {
  const { current = 1, pageSize = 10 } = paginationObj || {};
  fetchList(current, pageSize);
};

onMounted(() => {
  loadFromStorage();
  fetchList(1);
});
</script>

<template>
  <div>
    <ASpace class="mb-4">
      <AButton type="primary" @click="openCreate">New</AButton>
      <AInput
        v-model:value="query.name"
        placeholder="Search by name"
        style="width: 240px"
        @press-enter="() => fetchList(1)"
      />
      <AButton @click="() => fetchList(1)">Search</AButton>
    </ASpace>

    <ATable
      :data-source="itemsShown"
      row-key="id"
      :loading="loading"
      :pagination="{
        current: pagination.current,
        pageSize: pagination.pageSize,
        total: pagination.total,
      }"
      @change="handleTableChange"
    >
      <ATableColumn title="ID" data-index="id" key="id" />
      <ATableColumn title="Name" data-index="name" key="name" />
      <ATableColumn title="Description" data-index="desc" key="desc" />

      <ATableColumn title="Actions" key="actions">
        <template #default="{ record }">
          <ASpace>
            <AButton type="link" @click="openEdit(record)">Edit</AButton>
            <span style="display: inline-block; width: 16px"></span>
            <AButton type="link" danger @click="handleDelete(record.id)">
              Delete
            </AButton>
          </ASpace>
        </template>
      </ATableColumn>
    </ATable>

    <AModal
      v-model:open="visible"
      :title="editing.id ? 'Edit' : 'Create'"
      :confirm-loading="modalLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
      <AForm
        :model="editing"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <AFormItem label="Name">
          <AInput v-model:value="editing.name" />
        </AFormItem>
        <AFormItem label="Description">
          <AInput v-model:value="editing.desc" />
        </AFormItem>
      </AForm>
    </AModal>
  </div>
</template>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}
</style>
