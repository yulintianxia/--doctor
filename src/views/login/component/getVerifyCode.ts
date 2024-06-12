import { generateUUID } from '/@/utils/other';
import { state, imgSrc } from './password.vue';

//获取验证码图片
export const getVerifyCode = () => {
	state.ruleForm.randomStr = generateUUID();
	imgSrc.value = `${import.meta.env.VITE_API_URL}${import.meta.env.VITE_IS_MICRO == 'false' ? '/admin' : '/auth'}/code/image?randomStr=${state.ruleForm.randomStr}`;
};
