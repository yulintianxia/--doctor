<template>
	<div class="layout-padding">
		<div class="layout-padding-auto layout-padding-view">
			<el-row shadow="hover" v-show="showSearch" class="ml10">
				<el-form :model="state.queryForm" ref="queryRef" :inline="true" @keyup.enter="getDataList">
					<el-form-item :label="t('departmentalDaily.nickname')" prop="userId">
						<el-select collapse-tags collapse-tags-tooltip v-model="state.queryForm.userId">
							<el-option :key="index" :label="item.nickname" :value="item.userId" v-for="(item, index) in nickNameList"></el-option>
						</el-select>
					</el-form-item>
					<el-form-item :label="t('departmentalDaily.chioceMonth')" prop="month">
						<el-date-picker
							v-model="state.queryForm.month"
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
					</el-form-item>
				</el-form>
			</el-row>
			<el-row>
				<div class="mb8" style="width: 100%">
					<!-- <el-button icon="folder-add" type="primary" class="ml10" @click="roleDialogRef.openDialog()" v-auth="'sys_role_add'">
						{{ $t('common.addBtn') }}
					</el-button>
					<el-button plain icon="upload-filled" type="primary" class="ml10" @click="excelUploadRef.show()" v-auth="'sys_user_add'">
						{{ $t('common.importBtn') }}
					</el-button>
					<el-button plain :disabled="multiple" icon="Delete" type="primary" class="ml10" v-auth="'sys_user_del'" @click="handleDelete(selectObjs)">
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
				<el-table-column type="index" :label="$t('departmentalDaily.index')" width="70" />
				<el-table-column prop="nickname" :label="$t('departmentalDaily.nickname')" show-overflow-tooltip></el-table-column>
				<!-- <el-table-column prop="month" :label="$t('departmentalDaily.month')" show-overflow-tooltip></el-table-column> -->
				<el-table-column prop="city" :label="$t('departmentalDaily.city')" show-overflow-tooltip></el-table-column>
				<el-table-column prop="deptName" :label="$t('departmentalDaily.deptName')" show-overflow-tooltip></el-table-column>
				<el-table-column prop="lushang" :label="$t('departmentalDaily.lushang')" show-overflow-tooltip></el-table-column>
				<el-table-column prop="mendian" :label="$t('departmentalDaily.mendian')" show-overflow-tooltip></el-table-column>
				<el-table-column prop="jiangke" :label="$t('departmentalDaily.jiangke')" show-overflow-tooltip></el-table-column>
				<el-table-column prop="yizhen" :label="$t('departmentalDaily.yizhen')" show-overflow-tooltip></el-table-column>
				<el-table-column prop="yizhenNum" :label="$t('departmentalDaily.yizhenNum')" show-overflow-tooltip></el-table-column>
				<el-table-column prop="chengjiaoNum" :label="$t('departmentalDaily.chengjiaoNum')" show-overflow-tooltip></el-table-column>
				<el-table-column prop="chudan" :label="$t('departmentalDaily.chudan')" show-overflow-tooltip></el-table-column>
				<el-table-column prop="unitPrice" :label="$t('departmentalDaily.unitPrice')" show-overflow-tooltip></el-table-column>
				<!-- <el-table-column :label="$t('common.action')" width="250">
					<template #default="scope">
						<el-button text type="primary" icon="edit-pen" v-auth="'sys_role_edit'" @click="roleDialogRef.openDialog(scope.row.roleId)">{{
							$t('common.editBtn')
						}}</el-button>

						<el-button text type="primary" icon="turn-off" v-auth="'sys_role_del'" @click="permessionRef.openDialog(scope.row)">{{
							$t('departmentalDaily.permissionTip')
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
				</el-table-column> -->
			</el-table>
			<pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" v-bind="state.pagination" />
		</div>
		<!-- 角色编辑、新增  -->
		<!-- <role-dialog ref="roleDialogRef" @refresh="getDataList()" /> -->
		<!-- 导入角色 -->
		<!-- <upload-excel
			ref="excelUploadRef"
			:title="$t('sysuser.importUserTip')"
			url="/admin/role/import"
			temp-url="/admin/sys-file/local/file/role.xlsx"
			@refreshDataList="getDataList"
		/> -->
		<!-- 授权 -->
		<!-- <permession ref="permessionRef" /> -->
	</div>
</template>

<script setup lang="ts" name="systemRole">
import { BasicTableProps, useTable } from '/@/hooks/table';
import { getList, getUser as userList } from '/@/api/admin/departmentalDaily';
import { useI18n } from 'vue-i18n';
// 引入组件
const { t } = useI18n();

// 定义变量内容
const queryRef = ref();
const showSearch = ref(true);
// 多选rows
const selectObjs = ref([]) as any;
// 是否可以多选
const multiple = ref(true);

const months = ref([]) as any;
const state: BasicTableProps = reactive<BasicTableProps>({
	queryForm: {
		userId: '',
		// startTime: months?.length > 0 ? months.value[0] : '',
		// endTime: months?.length > 0 ? months.value[1] : '',
		month: '',
	},
	pageList: getList,
});

// const getDate = (value: Date[] | null) => {
// 	if (Array.isArray(value)) {
// 		state.queryForm.startTime = months.value[0];
// 		state.queryForm.endTime = months.value[1];
// 	} else {
// 		state.queryForm.endTime = '';
// 		state.queryForm.endTime = '';
// 	}
// };

// 医生列表
const nickNameList = ref([]) as any;

// 角色数据
const getTemplateData = () => {
	userList().then((res) => {
		console.log('res', res);
		nickNameList.value = res.data;
	});
};

// 获取模板信息
getTemplateData();

//  table hook
const { getDataList, currentChangeHandle, sizeChangeHandle, downBlobFile, tableStyle } = useTable(state);

// 清空搜索条件
const resetQuery = () => {
	queryRef.value.resetFields();
	getDataList();
};

// 导出excel
const exportExcel = () => {
	downBlobFile('/admin/doctor/daily/deptMonthStatistics/export', state.queryForm, 'role.xlsx');
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
