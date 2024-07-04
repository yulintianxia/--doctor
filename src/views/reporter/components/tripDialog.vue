<template>
	<div class="system-user-dialog-container">
		<el-dialog :close-on-click-modal="false" :title="dataForm.userId ? $t('common.editBtn') : $t('common.addBtn')" draggable v-model="visible">
			<el-form :model="dataForm" :rules="dataRules" label-width="90px" ref="dataFormRef" v-loading="loading">
				<el-row :gutter="20">
					<el-col :span="24" class="mb20">
						<el-form-item :label="$t('departmentalDaily.nickname')" prop="nickname">
							<el-select class="w100" clearable placeholder="请选择昵称" v-model="dataForm.nickname">
								<el-option :key="index" :label="item.nickname" :value="item.userId" v-for="(item, index) in nickNameList"></el-option>
							</el-select>
						</el-form-item>
					</el-col>
					<el-col :span="24" class="mb20">
						<el-form-item :label="t('departmentalDaily.chioceMonth')" prop="month">
							<el-date-picker
								style="width: 100%"
								@change="getDate"
								v-model="dataForm.month"
								type="month"
								placeholder="请选择月份"
								value-format="YYYY-MM"
							/>
						</el-form-item>
					</el-col>
					<el-col :span="12" v-for="(item, index) in dateCity" class="mb20">
						<el-form-item
							:label="item.day + '号'"
							:rules="{
								required: true,
								message: '请填写城市',
							}"
							:prop="'dateCity.' + index + '.city'"
						>
							<el-input placeholder="请填写城市" v-model="item.city"></el-input>
						</el-form-item>
					</el-col>
				</el-row>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button @click="visible = false">{{ $t('common.cancelButtonText') }}</el-button>
					<el-button @click="onSubmit" type="primary" :disabled="loading">{{ $t('common.confirmButtonText') }}</el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script lang="ts" name="systemUserDialog" setup>
import { addObj, getObj, putObj, validatePhone, validateUsername } from '/@/api/admin/user';
import { useDict } from '/@/hooks/dict';
import { useI18n } from 'vue-i18n';
import { useMessage } from '/@/hooks/message';
import { rule } from '/@/utils/validate';
import { dayjs } from 'element-plus';
const { t } = useI18n();

// 定义刷新表格emit
const emit = defineEmits(['refresh']);
// @ts-ignore
const { lock_flag } = useDict('lock_flag');

// 定义变量内容
const dataFormRef = ref();
const visible = ref(false);
const loading = ref(false);

const nickNameList = ref([]) as any;

const dataForm = reactive({
	userId: '',
	nickname: '',
	month: '',
});
const calendar = ref(new Date());

const dataRules = ref({
	// 用户名校验，不能为空 、长度 5-20、不能和已有数据重复
	nickname: [{ required: true, message: '昵称不能为空', trigger: 'blur' }],
	month: [{ required: true, message: '月份选择不能为空', trigger: 'blur' }],
});

const dateCity = ref([]) as any;

/* 获取到当前号数 */
const getDate = (value) => {
	dateCity.value = [];
	if (value) {
		let maxDay = dayjs(value).daysInMonth();
		for (let i = 0; i < maxDay; i++) {
			dateCity.value.push({
				day: i + 1,
				city: '',
			});
		}
	}
};

// 打开弹窗
const openDialog = async (id: string) => {
	visible.value = true;
	dataForm.userId = '';
	dataForm.month = '';
	dateCity.value = [];
	// 重置表单数据
	nextTick(() => {
		dataFormRef.value?.resetFields();
	});

	// 修改获取用户信息
	if (id) {
		dataForm.userId = id;
	}
};

// 提交
const onSubmit = async () => {
	const valid = await dataFormRef.value.validate().catch(() => {});
	if (!valid) return false;

	try {
		const { userId, month, dateCity } = dataForm;

		if (userId) {
			loading.value = true;
			await putObj(dataForm);
			useMessage().success(t('common.editSuccessText'));
			visible.value = false; // 关闭弹窗
			emit('refresh');
		} else {
			loading.value = true;
			await addObj(dataForm);
			useMessage().success(t('common.addSuccessText'));
			visible.value = false; // 关闭弹窗
			emit('refresh');
		}
	} catch (error: any) {
		useMessage().error(error.msg);
	} finally {
		loading.value = false;
	}
};

// 暴露变量
defineExpose({
	openDialog,
});
</script>

<style lang="scss">
.el-calendar-table:not(.is-range) td.next,
.el-calendar-table:not(.is-range) td.prev {
	pointer-events: none;
}
</style>
