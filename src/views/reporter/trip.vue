<template>
	<div class="layout-padding">
		<div class="layout-padding-auto layout-padding-view">
			<el-row shadow="hover" v-show="showSearch" class="ml10">
				<el-form :model="state.queryForm" ref="queryRef" :inline="true" @keyup.enter="getDataList">
					<el-form-item :label="t('departmentalDaily.nickname')" prop="userId">
						<el-select filterable collapse-tags collapse-tags-tooltip v-model="state.queryForm.userId">
							<el-option :key="index" :label="item.nickname" :value="item.userId" v-for="(item, index) in nickNameList"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item :label="t('trip.city')" prop="city">
						<el-input :placeholder="t('trip.city')" v-model="state.queryForm.city" />
					</el-form-item>
					<el-form-item :label="t('departmentalDaily.chioceMonth')" prop="months">
						<el-date-picker
							@change="getDate"
							v-model="months"
							type="monthrange"
							range-separator="到"
							start-placeholder="开始月份"
							end-placeholder="结束月份"
							value-format="YYYY-MM"
						/>
					</el-form-item>
					<el-form-item>
						<el-button icon="search" type="primary" @click="getDataList">
							{{ $t('common.queryBtn') }}
						</el-button>
						<el-button icon="Refresh" @click="resetQuery">{{ $t('common.resetBtn') }}</el-button>
						<el-button icon="ZoomIn" @click="exportIn">{{ $t('trip.exportIn') }}</el-button>
					</el-form-item>
				</el-form>
			</el-row>
			<el-row>
				<div class="mb8" style="width: 100%">
					<el-button icon="folder-add" type="primary" class="ml10" @click="tripDialogRef.openDialog()">
						{{ $t('common.addBtn') }}
					</el-button>
					<el-button plain icon="upload-filled" type="primary" class="ml10" @click="excelUploadRef.show()">
						{{ $t('common.importBtn') }}
					</el-button>
					<!-- <el-button plain :disabled="multiple" icon="Delete" type="primary" class="ml10" v-auth="'sys_user_del'" @click="handleDelete(selectObjs)">
						{{ $t('common.delBtn') }}
					</el-button> -->
					<right-toolbar
						v-model:showSearch="showSearch"
						:export="'sys_role_export'"
						@exportExcel="exportExcel"
						class="ml10"
						style="float: right; margin-right: 20px"
						@queryTable="getDataList"
					></right-toolbar>
				</div>
			</el-row>
			<el-table
				:data="state.dataList"
				v-loading="state.loading"
				style="width: 100%"
				border
				:cell-style="tableStyle.cellStyle"
				:header-cell-style="tableStyle.headerCellStyle"
			>
				<!-- <el-table-column type="selection" :selectable="handleSelectable" width="50" align="center" /> -->
				<el-table-column type="index" :label="$t('trip.index')" width="70" />
				<el-table-column prop="group" :label="$t('trip.group')" show-overflow-tooltip></el-table-column>
				<el-table-column prop="teacherName" :label="$t('trip.teacherName')" show-overflow-tooltip></el-table-column>
				<el-table-column prop="months" :label="$t('trip.months')" show-overflow-tooltip>
					<el-table-column prop="day1" label="1号" width="60" />
					<el-table-column prop="day2" label="2号" width="60" />
					<el-table-column prop="day3" label="3号" width="60" />
					<el-table-column prop="day4" label="4号" width="60" />
					<el-table-column prop="day5" label="5号" width="60" />
				</el-table-column>
				<el-table-column :label="$t('common.action')" width="250">
					<template #default="scope">
						<el-button text type="primary" icon="edit-pen" v-auth="'sys_role_edit'" @click="tripDialogRef.openDialog(scope.row.roleId)">{{
							$t('common.editBtn')
						}}</el-button>

						<el-tooltip :content="$t('departmentalDaily.deleteDisabledTip')" :disabled="scope.row.roleId !== '1'" placement="top">
							<span style="margin-left: 12px">
								<el-button
									text
									type="primary"
									icon="delete"
									:disabled="scope.row.roleId === '1'"
									v-auth="'sys_role_del'"
									@click="handleDelete([scope.row.roleId])"
									>{{ $t('common.delBtn') }}
								</el-button>
							</span>
						</el-tooltip>
					</template>
				</el-table-column>
			</el-table>
			<pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" v-bind="state.pagination" />
		</div>

		<!-- 角色编辑、新增  -->
		<trip-dialog ref="tripDialogRef" @refresh="getDataList()" />
		<!-- 导入角色 -->
		<upload-excel
			ref="excelUploadRef"
			:title="$t('trip.tripExportIn')"
			url="/admin/role/import"
			temp-url="/admin/sys-file/local/file/role.xlsx"
			@refreshDataList="getDataList"
		/>
		<!-- 授权 -->
		<!-- <permession ref="permessionRef" /> -->
	</div>
</template>

<script setup lang="ts" name="systemRole">
import { BasicTableProps, useTable } from '/@/hooks/table';
import { myDailyGetList, getUser as userList } from '/@/api/admin/departmentalDaily';
import { useMessage, useMessageBox } from '/@/hooks/message';
import { useI18n } from 'vue-i18n';
import { deptTree } from '/@/api/admin/dept';
const tripDialog = defineAsyncComponent(() => import('./components/tripDialog.vue'));

// 引入组件
const { t } = useI18n();

// 定义变量内容
const tripDialogRef = ref();
const permessionRef = ref();
const excelUploadRef = ref();
const queryRef = ref();
const showSearch = ref(true);
// 多选rows
const selectObjs = ref([]) as any;
// 是否可以多选
const multiple = ref(true);

const userId = sessionStorage.getItem('user_id');
const state: BasicTableProps = reactive<BasicTableProps>({
	queryForm: {
		// userId,
		userId: '',
		// deptIds: '',
		city: '',
	},
	pageList: myDailyGetList, // H
	// descs: ['create_time'],
});

const months = ref([]);
const getDate = (value: Date[] | null) => {
	if (Array.isArray(value)) {
		// state.queryForm.startDate = months.value[0];
		// state.queryForm.endDate = months.value[1];
		state.queryForm = {
			...state.queryForm,
			startDate: months.value[0],
			endDate: months.value[1],
		};
	} else {
		// state.queryForm.startDate = '';
		// state.queryForm.endDate = '';
		delete state.queryForm.startDate;
		delete state.queryForm.endDate;
	}
};

// 删除按钮
const handleDelete = ([id]: number[]) => {};

const nickNameList = ref([]) as any;

// 角色数据
const getTemplateData = () => {
	userList().then((res) => {
		nickNameList.value = res.data;
	});
};

const exportIn = () => {};

const deptData = ref<any[]>([]);

// 初始化部门数据
const getDeptData = () => {
	// 获取部门数据
	deptTree().then((res) => {
		deptData.value = res.data;
	});
};

// 加载使用的数据
getDeptData();

getTemplateData();

//  table hook
const { getDataList, currentChangeHandle, sizeChangeHandle, downBlobFile, tableStyle } = useTable(state);

// 清空搜索条件
const resetQuery = () => {
	queryRef.value.resetFields();
	months.value = [];
	delete state.queryForm.startDate;
	delete state.queryForm.endDate;
	// state.queryForm.user_id = userId;
	getDataList();
};

// 导出excel
const exportExcel = () => {
	downBlobFile('/admin/doctor/daily/monthDailyInfo/export', state.queryForm, '我的日报.xlsx');
};

// 是否可以多选
const handleSelectable = (row: any) => {
	return row.roleId !== '1';
};

// 多选事件
const handleSelectionChange = (objs: { roleId: string }[]) => {
	selectObjs.value = objs.map(({ roleId }) => roleId);
	multiple.value = !objs.length;
};
</script>
